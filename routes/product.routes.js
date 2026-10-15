import { Router } from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { pagination } from "../middlewares/pagination.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const productRouter = Router();

// GET /api/v1/products - Get all products (public) with search and pagination
productRouter.get('/', pagination, asyncHandler(getProducts));

// GET /api/v1/products/:id - Get product by ID (public)
productRouter.get('/:id', asyncHandler(getProductById));

// POST /api/v1/products - Create product (admin only)
productRouter.post('/', authenticate, authorize(['admin', 'super_admin']), asyncHandler(createProduct));

// PUT /api/v1/products/:id - Update product (admin only)
productRouter.put('/:id', authenticate, authorize(['admin', 'super_admin']), asyncHandler(updateProduct));

// DELETE /api/v1/products/:id - Delete product (admin only)
productRouter.delete('/:id', authenticate, authorize(['admin', 'super_admin']), asyncHandler(deleteProduct));

export default productRouter;

