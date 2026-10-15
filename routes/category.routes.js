import { Router } from "express";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const categoryRouter = Router();

// GET /api/v1/categories - Get all categories (public)
categoryRouter.get('/', asyncHandler(getCategories));

// GET /api/v1/categories/:id - Get category by ID (public)
categoryRouter.get('/:id', asyncHandler(getCategoryById));

// POST /api/v1/categories - Create category (admin only)
categoryRouter.post('/', authenticate, authorize(['admin', 'super_admin']), asyncHandler(createCategory));

// PUT /api/v1/categories/:id - Update category (admin only)
categoryRouter.put('/:id', authenticate, authorize(['admin', 'super_admin']), asyncHandler(updateCategory));

// DELETE /api/v1/categories/:id - Delete category (admin only)
categoryRouter.delete('/:id', authenticate, authorize(['admin', 'super_admin']), asyncHandler(deleteCategory));

export default categoryRouter;

