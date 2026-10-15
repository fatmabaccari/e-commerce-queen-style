import ProductVariantModel from '../models/productVariant.model.js';
import AppError from '../middlewares/AppError.js';

/**
 * Get cart items from session
 */
export const getCart = async (req, res, next) => {
    try {
        const cart = req.session.cart || [];
        
        // Enrich cart items with product variant details
        const enrichedCart = await Promise.all(
            cart.map(async (item) => {
                try {
                    const variant = await ProductVariantModel.findById(item.variant_id);
                    if (!variant) {
                        return null; // Variant no longer exists
                    }
                    return {
                        variant_id: item.variant_id,
                        quantity: item.quantity,
                        variant: variant,
                    };
                } catch (error) {
                    return null;
                }
            })
        );

        // Filter out null items (deleted variants)
        const validCart = enrichedCart.filter(item => item !== null);

        // Calculate totals
        let subtotal = 0;
        validCart.forEach(item => {
            subtotal += item.variant.price * item.quantity;
        });

        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            data: {
                items: validCart,
                subtotal: subtotal.toFixed(2),
                itemCount: validCart.reduce((sum, item) => sum + item.quantity, 0),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add item to cart
 */
export const addToCart = async (req, res, next) => {
    try {
        const { variant_id, quantity } = req.body;

        if (!variant_id || !quantity) {
            throw new AppError('Variant ID and quantity are required', 400);
        }

        if (quantity < 1) {
            throw new AppError('Quantity must be at least 1', 400);
        }

        // Check if variant exists and has stock
        const variant = await ProductVariantModel.findById(variant_id);
        if (!variant) {
            throw new AppError('Product variant not found', 404);
        }

        // Initialize cart if it doesn't exist
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Check if item already exists in cart
        const existingItemIndex = req.session.cart.findIndex(
            item => item.variant_id === variant_id
        );

        if (existingItemIndex !== -1) {
            // Update quantity
            const newQuantity = req.session.cart[existingItemIndex].quantity + quantity;
            
            // Check stock availability
            if (newQuantity > variant.stock_quantity) {
                throw new AppError(
                    `Insufficient stock. Available: ${variant.stock_quantity}`,
                    400
                );
            }

            req.session.cart[existingItemIndex].quantity = newQuantity;
        } else {
            // Check stock availability
            if (quantity > variant.stock_quantity) {
                throw new AppError(
                    `Insufficient stock. Available: ${variant.stock_quantity}`,
                    400
                );
            }

            // Add new item
            req.session.cart.push({
                variant_id: variant_id,
                quantity: quantity,
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                cart: req.session.cart,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req, res, next) => {
    try {
        const { variant_id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            throw new AppError('Quantity must be at least 1', 400);
        }

        if (!req.session.cart) {
            throw new AppError('Cart is empty', 404);
        }

        const itemIndex = req.session.cart.findIndex(
            item => item.variant_id === parseInt(variant_id)
        );

        if (itemIndex === -1) {
            throw new AppError('Item not found in cart', 404);
        }

        // Check stock availability
        const variant = await ProductVariantModel.findById(variant_id);
        if (!variant) {
            throw new AppError('Product variant not found', 404);
        }

        if (quantity > variant.stock_quantity) {
            throw new AppError(
                `Insufficient stock. Available: ${variant.stock_quantity}`,
                400
            );
        }

        req.session.cart[itemIndex].quantity = quantity;

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: {
                cart: req.session.cart,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req, res, next) => {
    try {
        const { variant_id } = req.params;

        if (!req.session.cart) {
            throw new AppError('Cart is empty', 404);
        }

        const itemIndex = req.session.cart.findIndex(
            item => item.variant_id === parseInt(variant_id)
        );

        if (itemIndex === -1) {
            throw new AppError('Item not found in cart', 404);
        }

        req.session.cart.splice(itemIndex, 1);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: {
                cart: req.session.cart,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear cart
 */
export const clearCart = async (req, res, next) => {
    try {
        req.session.cart = [];

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
        });
    } catch (error) {
        next(error);
    }
};

