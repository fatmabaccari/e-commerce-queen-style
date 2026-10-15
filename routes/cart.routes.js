import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cart.controller.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const cartRouter = Router();

// All cart routes are public (session-based)
// GET /api/v1/cart - Get cart items
cartRouter.get('/', asyncHandler(getCart));

// POST /api/v1/cart - Add item to cart
cartRouter.post('/', asyncHandler(addToCart));

// PUT /api/v1/cart/:variant_id - Update cart item quantity
cartRouter.put('/:variant_id', asyncHandler(updateCartItem));

// DELETE /api/v1/cart/:variant_id - Remove item from cart
cartRouter.delete('/:variant_id', asyncHandler(removeFromCart));

// DELETE /api/v1/cart - Clear entire cart
cartRouter.delete('/', asyncHandler(clearCart));

export default cartRouter;

