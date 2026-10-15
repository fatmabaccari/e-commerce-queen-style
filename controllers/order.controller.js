import OrderModel from '../models/order.model.js';
import OrderItemModel from '../models/orderItem.model.js';
import ProductVariantModel from '../models/productVariant.model.js';
import AdminModel from '../models/admin.model.js';
import AppError from '../middlewares/AppError.js';
import { createPaginationResponse } from '../middlewares/pagination.middleware.js';

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

export const getOrders = async (req, res, next) => {
    try {
        const { status, user_id } = req.query;
        const filters = {};
        
        // Check if user is an admin (since authenticate doesn't set req.user.admin)
        let isAdmin = false;
        if (req.user?.userId) {
            try {
                const admin = await AdminModel.findById(req.user.userId);
                isAdmin = !!admin;
            } catch (error) {
                // Not an admin, continue as regular user
                isAdmin = false;
            }
        }
        
        // If user is not admin, only show their orders
        if (!isAdmin) {
            if (req.user) {
                filters.user_id = req.user.userId;
            } else {
                throw new AppError('Authentication required to view orders', 401);
            }
        } else if (user_id) {
            // Admin can filter by user_id if provided
            filters.user_id = user_id ? parseInt(user_id) : null;
        }
        // If admin and no user_id filter, show all orders (no user_id filter)
        
        if (status) filters.status = status;

        // Add pagination if provided
        if (req.pagination) {
            filters.skip = req.pagination.skip;
            filters.limit = req.pagination.limit;
        }

        const [orders, total] = await Promise.all([
            OrderModel.findAll(filters),
            OrderModel.count(filters),
        ]);

        const response = req.pagination
            ? createPaginationResponse(orders, total, req.pagination)
            : {
                success: true,
                message: 'Orders fetched successfully',
                data: orders,
            };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Try to find by ID first
        let orderId = parseInt(id);
        let order = null;

        if (!isNaN(orderId)) {
            order = await OrderModel.findById(orderId);
        } else {
            // If not a number, try to find by order number
            order = await OrderModel.findByOrderNumber(id);
        }

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Check ownership (users can only see their own orders, admins can see all)
        // Guest orders (user_id is null) can be accessed by anyone with order number
        if (!req.user?.admin) {
            if (order.user_id && (!req.user || order.user_id !== req.user.userId)) {
                throw new AppError('Access denied. You can only access your own orders.', 403);
            }
            // Guest orders (user_id is null) can be accessed by order number
        }

        res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const orders = await OrderModel.findByUserId(userId);

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            data: orders,
        });
    } catch (error) {
        next(error);
    }
};

export const createOrder = async (req, res, next) => {
    try {
        // Guest checkout: user_id is optional (can be null)
        // Validation is handled by validateOrder middleware
        const userId = req.user?.userId || null;
        const { full_name, phone, address, city, note, payment_method, items } = req.body;

        // Use items from request body, or from session cart if items not provided
        // Note: validateOrder middleware allows items to be undefined (will come from cart)
        let orderItems = items;
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            // Try to get items from session cart
            if (req.session.cart && req.session.cart.length > 0) {
                orderItems = req.session.cart.map(item => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                }));
            } else {
                throw new AppError('Order must contain at least one item', 400);
            }
        }

        // Calculate totals and validate stock (but don't update yet)
        let subtotal = 0;
        const processedOrderItems = [];

        for (const item of orderItems) {
            const variant = await ProductVariantModel.findById(item.variant_id);
            if (!variant) {
                throw new AppError(`Product variant ${item.variant_id} not found`, 404);
            }

            // Check stock availability (but don't deduct yet)
            if (variant.stock_quantity < item.quantity) {
                throw new AppError(`Insufficient stock for variant ${item.variant_id}. Available: ${variant.stock_quantity}`, 400);
            }

            const itemPrice = variant.price * item.quantity;
            subtotal += itemPrice;

            processedOrderItems.push({
                product_id: variant.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: variant.price,
            });
        }

        const discount_total = 0; // TODO: Calculate discounts
        const total_amount = subtotal - discount_total;

        // Create order (user_id can be null for guest checkout)
        const order = await OrderModel.create({
            order_number: generateOrderNumber(),
            user_id: userId,
            full_name: full_name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            note: note ? note.trim() : null,
            payment_method, // Already normalized by validateOrder middleware
            status: 'pending',
            subtotal,
            discount_total,
            total_amount,
        });

        // Create order items (stock will be updated when order status changes to 'delivered')
        for (const item of processedOrderItems) {
            await OrderItemModel.create({
                order_id: order.id,
                ...item,
            });
        }

        // Clear cart after successful order creation
        if (req.session.cart) {
            req.session.cart = [];
        }

        // Fetch complete order with items
        const completeOrder = await OrderModel.findById(order.id);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: completeOrder,
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const orderId = parseInt(id);
        const { status } = req.body;

        if (isNaN(orderId)) {
            throw new AppError('Invalid order ID', 400);
        }

        // Status validation is handled by validateOrderStatusUpdate middleware
        const order = await OrderModel.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Only admins can update order status
        if (!req.user.admin) {
            throw new AppError('Access denied. Only admins can update order status.', 403);
        }

        const previousStatus = order.status;

        // Update order status
        const updatedOrder = await OrderModel.updateStatus(orderId, status);

        // Update stock ONLY when order status changes to 'delivered'
        if (status === 'delivered' && previousStatus !== 'delivered') {
            // Deduct stock when order is delivered
            if (order.order_items && order.order_items.length > 0) {
                for (const item of order.order_items) {
                    await ProductVariantModel.updateStock(item.variant_id, -item.quantity);
                }
            }
        } 
        // Restore stock if order is cancelled (and was previously delivered)
        else if (status === 'cancelled' && previousStatus === 'delivered') {
            // Restore stock if order was delivered and is now cancelled
            if (order.order_items && order.order_items.length > 0) {
                for (const item of order.order_items) {
                    await ProductVariantModel.updateStock(item.variant_id, item.quantity);
                }
            }
        }

        // Fetch updated order
        const finalOrder = await OrderModel.findById(orderId);

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: finalOrder,
        });
    } catch (error) {
        next(error);
    }
};

