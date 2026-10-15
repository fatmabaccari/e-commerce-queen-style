import ProductVariantImageModel from '../models/productVariantImage.model.js';
import AppError from '../middlewares/AppError.js';
import { getFileUrl } from '../middlewares/upload.middleware.js';

export const getVariantImages = async (req, res, next) => {
    try {
        const { variant_id } = req.params;
        const variantId = parseInt(variant_id);

        if (isNaN(variantId)) {
            throw new AppError('Invalid variant ID', 400);
        }

        const images = await ProductVariantImageModel.findByVariantId(variantId);

        // Add full URLs to images
        const imagesWithUrls = images.map(image => ({
            ...image,
            image_url: getFileUrl(image.image_url),
        }));

        res.status(200).json({
            success: true,
            message: 'Variant images fetched successfully',
            data: imagesWithUrls,
        });
    } catch (error) {
        next(error);
    }
};

export const uploadVariantImage = async (req, res, next) => {
    try {
        const { variant_id } = req.params;
        const variantId = parseInt(variant_id);
        const { sort_order } = req.body;

        if (isNaN(variantId)) {
            throw new AppError('Invalid variant ID', 400);
        }

        if (!req.file) {
            throw new AppError('Image file is required', 400);
        }

        const image = await ProductVariantImageModel.create({
            variant_id: variantId,
            image_url: req.file.filename,
            sort_order: sort_order ? parseInt(sort_order) : null,
        });

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                ...image,
                image_url: getFileUrl(image.image_url),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const uploadMultipleVariantImages = async (req, res, next) => {
    try {
        const { variant_id } = req.params;
        const variantId = parseInt(variant_id);

        if (isNaN(variantId)) {
            throw new AppError('Invalid variant ID', 400);
        }

        if (!req.files || req.files.length === 0) {
            throw new AppError('At least one image file is required', 400);
        }

        const images = await Promise.all(
            req.files.map((file, index) =>
                ProductVariantImageModel.create({
                    variant_id: variantId,
                    image_url: file.filename,
                    sort_order: index + 1,
                })
            )
        );

        const imagesWithUrls = images.map(image => ({
            ...image,
            image_url: getFileUrl(image.image_url),
        }));

        res.status(201).json({
            success: true,
            message: 'Images uploaded successfully',
            data: imagesWithUrls,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteVariantImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const imageId = parseInt(id);

        if (isNaN(imageId)) {
            throw new AppError('Invalid image ID', 400);
        }

        const image = await ProductVariantImageModel.findById(imageId);
        if (!image) {
            throw new AppError('Image not found', 404);
        }

        await ProductVariantImageModel.delete(imageId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

