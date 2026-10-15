import { Router } from "express";
import {
    getDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
} from "../controllers/discount.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateDiscount } from "../middlewares/validation.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const discountRouter = Router();

// GET /api/v1/discounts - Get all discounts (public, with active_only query)
discountRouter.get('/', asyncHandler(getDiscounts));

// GET /api/v1/discounts/:id - Get discount by ID (public)
discountRouter.get('/:id', asyncHandler(getDiscountById));

// POST /api/v1/discounts - Create discount (admin only)
discountRouter.post('/', authenticate, authorize(['admin', 'super_admin']), validateDiscount, asyncHandler(createDiscount));

// PUT /api/v1/discounts/:id - Update discount (admin only)
discountRouter.put('/:id', authenticate, authorize(['admin', 'super_admin']), validateDiscount, asyncHandler(updateDiscount));

// DELETE /api/v1/discounts/:id - Delete discount (admin only)
discountRouter.delete('/:id', authenticate, authorize(['admin', 'super_admin']), asyncHandler(deleteDiscount));

export default discountRouter;

