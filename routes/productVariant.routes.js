import { Router } from "express";
import {
    getProductVariants,
    getProductVariantById,
    createProductVariant,
    updateProductVariant,
    deleteProductVariant,
} from "../controllers/productVariant.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const productVariantRouter = Router();

// GET /api/v1/product-variants - Get variants by product_id (public)
productVariantRouter.get('/', asyncHandler(getProductVariants));

// GET /api/v1/product-variants/:id - Get variant by ID (public)
productVariantRouter.get('/:id', asyncHandler(getProductVariantById));

// POST /api/v1/product-variants - Create variant (admin only)
productVariantRouter.post('/', authenticate, authorize(['admin', 'super_admin']), asyncHandler(createProductVariant));

// PUT /api/v1/product-variants/:id - Update variant (admin only)
productVariantRouter.put('/:id', authenticate, authorize(['admin', 'super_admin']), asyncHandler(updateProductVariant));

// DELETE /api/v1/product-variants/:id - Delete variant (admin only)
productVariantRouter.delete('/:id', authenticate, authorize(['admin', 'super_admin']), asyncHandler(deleteProductVariant));

export default productVariantRouter;

