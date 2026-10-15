import { Router } from "express";
import {
    getVariantImages,
    uploadVariantImage,
    uploadMultipleVariantImages,
    deleteVariantImage,
} from "../controllers/productVariantImage.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadSingle, uploadMultiple } from "../middlewares/upload.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const productVariantImageRouter = Router();

// GET /api/v1/product-variants/:variant_id/images - Get variant images (public)
productVariantImageRouter.get('/:variant_id/images', asyncHandler(getVariantImages));

// POST /api/v1/product-variants/:variant_id/images - Upload single image (admin only)
productVariantImageRouter.post(
    '/:variant_id/images',
    authenticate,
    authorize(['admin', 'super_admin']),
    uploadSingle('image'),
    asyncHandler(uploadVariantImage)
);

// POST /api/v1/product-variants/:variant_id/images/multiple - Upload multiple images (admin only)
productVariantImageRouter.post(
    '/:variant_id/images/multiple',
    authenticate,
    authorize(['admin', 'super_admin']),
    uploadMultiple('images', 10),
    asyncHandler(uploadMultipleVariantImages)
);

// DELETE /api/v1/product-variants/images/:id - Delete image (admin only)
productVariantImageRouter.delete(
    '/images/:id',
    authenticate,
    authorize(['admin', 'super_admin']),
    asyncHandler(deleteVariantImage)
);

export default productVariantImageRouter;

