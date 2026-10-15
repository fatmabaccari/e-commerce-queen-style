import { Router } from "express";
import {
    getOrders,
    getOrderById,
    getMyOrders,
    createOrder,
    updateOrderStatus,
} from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateOrder, validateOrderStatusUpdate } from "../middlewares/validation.middleware.js";
import { pagination } from "../middlewares/pagination.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const orderRouter = Router();

// GET /api/v1/orders/my - Get current user's orders
orderRouter.get('/my', authenticate, asyncHandler(getMyOrders));

// GET /api/v1/orders - Get all orders (admin) or user's orders
orderRouter.get('/', authenticate, pagination, asyncHandler(getOrders));

// GET /api/v1/orders/:id - Get order by ID or order number (public for guest orders)
orderRouter.get('/:id', asyncHandler(getOrderById));

// POST /api/v1/orders - Create new order (guest checkout allowed)
orderRouter.post('/', validateOrder, asyncHandler(createOrder));

// PUT /api/v1/orders/:id/status - Update order status (admin only)
orderRouter.put('/:id/status', authenticate, authorize(['admin', 'super_admin']), validateOrderStatusUpdate, asyncHandler(updateOrderStatus));

export default orderRouter;

