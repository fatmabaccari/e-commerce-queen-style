import ProductModel from '../models/product.model.js';
import AppError from '../middlewares/AppError.js';
import { createPaginationResponse } from '../middlewares/pagination.middleware.js';
import prisma from '../database/prisma-client.js';

// Helper functions to apply active discounts to prices without mutating the database
const isDiscountActive = (discount, now) => {
    if (!discount) return false;
    const start = discount.start_date ? new Date(discount.start_date) : null;
    const end = discount.end_date ? new Date(discount.end_date) : null;
    if (!start || !end) return false;
    return start <= now && end >= now;
};

const calculateDiscountedPrice = (basePrice, discount) => {
    if (discount.type === 'percentage') {
        const amountOff = (basePrice * discount.value) / 100;
        return Math.max(0, basePrice - amountOff);
    }
    if (discount.type === 'fixed') {
        return Math.max(0, basePrice - discount.value);
    }
    return basePrice;
};

const getProductDiscounts = (product, now) => {
    const discounts = [];

    // Discounts directly attached to product
    if (product.discount_products) {
        for (const dp of product.discount_products) {
            if (dp.discounts && isDiscountActive(dp.discounts, now)) {
                discounts.push(dp.discounts);
            }
        }
    }

    // Discounts attached via category
    if (product.categories && product.categories.discount_categories) {
        for (const dc of product.categories.discount_categories) {
            if (dc.discounts && isDiscountActive(dc.discounts, now)) {
                discounts.push(dc.discounts);
            }
        }
    }

    return discounts;
};

const applyDiscountsToProduct = (product) => {
    const now = new Date();
    const discounts = getProductDiscounts(product, now);

    if (!discounts.length) {
        // No discounts; still attach original variants for consistency
        const productWithVariants = {
            ...product,
            product_variants: product.product_variants?.map((variant) => ({
                ...variant,
            })) || [],
        };
        return productWithVariants;
    }

    // Compute best (lowest) discounted price for the product base price
    let bestProductPrice = product.base_price;
    for (const discount of discounts) {
        const candidate = calculateDiscountedPrice(product.base_price, discount);
        if (candidate < bestProductPrice) {
            bestProductPrice = candidate;
        }
    }

    // Apply same discounts to each variant price
    const variantsWithEffective = (product.product_variants || []).map((variant) => {
        let bestVariantPrice = variant.price;
        for (const discount of discounts) {
            const candidate = calculateDiscountedPrice(variant.price, discount);
            if (candidate < bestVariantPrice) {
                bestVariantPrice = candidate;
            }
        }

        return {
            ...variant,
            effective_price: bestVariantPrice !== variant.price ? bestVariantPrice : undefined,
        };
    });

    return {
        ...product,
        effective_price: bestProductPrice !== product.base_price ? bestProductPrice : undefined,
        product_variants: variantsWithEffective,
    };
};

export const getProducts = async (req, res, next) => {
    try {
        const { category_id, search } = req.query;
        const filters = {};
        if (category_id) filters.category_id = parseInt(category_id);
        if (search) filters.search = search;

        // Add pagination
        if (req.pagination) {
            filters.skip = req.pagination.skip;
            filters.limit = req.pagination.limit;
        }

        const [productsRaw, total] = await Promise.all([
            ProductModel.findAll(filters),
            ProductModel.count(filters),
        ]);

        const products = productsRaw.map(applyDiscountsToProduct);

        const response = req.pagination
            ? createPaginationResponse(products, total, req.pagination)
            : {
                success: true,
                message: 'Products fetched successfully',
                data: products,
            };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            throw new AppError('Invalid product ID', 400);
        }

        const productRaw = await ProductModel.findById(productId);

        if (!productRaw) {
            throw new AppError('Product not found', 404);
        }

        const product = applyDiscountsToProduct(productRaw);

        res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const { product_reference, name, description, base_price, category_id } = req.body;

        // Validate product_reference format (6 digits)
        if (!product_reference) {
            throw new AppError('Product reference is required', 400);
        }

        const refStr = product_reference.toString().trim();
        if (!/^\d{6}$/.test(refStr)) {
            throw new AppError('Product reference must be exactly 6 digits', 400);
        }

        const newProduct = await ProductModel.create({
            product_reference: refStr,
            name: name.trim(),
            description: description ? description.trim() : null,
            base_price: parseFloat(base_price),
            category_id: category_id ? parseInt(category_id) : null,
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);
        const { name, description, base_price, category_id } = req.body;

        if (isNaN(productId)) {
            throw new AppError('Invalid product ID', 400);
        }

        const existingProduct = await ProductModel.findById(productId);
        if (!existingProduct) {
            throw new AppError('Product not found', 404);
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (base_price !== undefined) updateData.base_price = parseFloat(base_price);
        if (category_id !== undefined) updateData.category_id = category_id ? parseInt(category_id) : null;

        const updatedProduct = await ProductModel.update(productId, updateData);

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            throw new AppError('Invalid product ID', 400);
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Check if product or its variants are referenced in orders
        const orderItemsCount = await prisma.order_items.count({
            where: {
                OR: [
                    { product_id: productId },
                    { 
                        product_variants: {
                            product_id: productId
                        }
                    }
                ]
            }
        });

        if (orderItemsCount > 0) {
            throw new AppError('Cannot delete product: it is referenced in existing orders. Order history must be preserved.', 400);
        }

        // Use a transaction to ensure all deletions happen atomically
        await prisma.$transaction(async (tx) => {
            // Get all variants for this product
            const variants = await tx.product_variants.findMany({
                where: { product_id: productId },
                select: { id: true },
            });

            const variantIds = variants.map(v => v.id);

            if (variantIds.length > 0) {
                // Delete all variant images for all variants
                await tx.product_variant_images.deleteMany({
                    where: { variant_id: { in: variantIds } },
                });

                // Delete all stock movements for all variants
                await tx.stock_movements.deleteMany({
                    where: { variant_id: { in: variantIds } },
                });

                // Delete all variants
                await tx.product_variants.deleteMany({
                    where: { product_id: productId },
                });
            }

            // Finally, delete the product
            await tx.products.delete({
                where: { id: productId },
            });
        });

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        // If it's already an AppError, pass it through
        if (error instanceof AppError) {
            return next(error);
        }
        // Check if it's a foreign key constraint error
        if (error.code === 'P2003' || error.meta?.target) {
            throw new AppError('Cannot delete product: it is referenced in existing orders. Please archive or disable it instead.', 400);
        }
        next(error);
    }
};

