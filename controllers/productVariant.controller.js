import ProductVariantModel from '../models/productVariant.model.js';
import AppError from '../middlewares/AppError.js';

// Helper to reuse discount logic for standalone variant endpoints
const isDiscountActiveForVariant = (discount, now) => {
    if (!discount) return false;
    const start = discount.start_date ? new Date(discount.start_date) : null;
    const end = discount.end_date ? new Date(discount.end_date) : null;
    if (!start || !end) return false;
    return start <= now && end >= now;
};

const calculateDiscountedPriceForVariant = (basePrice, discount) => {
    if (discount.type === 'percentage') {
        const amountOff = (basePrice * discount.value) / 100;
        return Math.max(0, basePrice - amountOff);
    }
    if (discount.type === 'fixed') {
        return Math.max(0, basePrice - discount.value);
    }
    return basePrice;
};

const getVariantDiscounts = (variant, now) => {
    const discounts = [];
    const product = variant.products;

    if (!product) {
        return discounts;
    }

    // Discounts directly on product
    if (product.discount_products) {
        for (const dp of product.discount_products) {
            if (dp.discounts && isDiscountActiveForVariant(dp.discounts, now)) {
                discounts.push(dp.discounts);
            }
        }
    }

    // Discounts via category
    if (product.categories && product.categories.discount_categories) {
        for (const dc of product.categories.discount_categories) {
            if (dc.discounts && isDiscountActiveForVariant(dc.discounts, now)) {
                discounts.push(dc.discounts);
            }
        }
    }

    return discounts;
};

const applyDiscountsToVariant = (variant) => {
    const now = new Date();
    const discounts = getVariantDiscounts(variant, now);

    if (!discounts.length) {
        return { ...variant };
    }

    let bestPrice = variant.price;
    for (const discount of discounts) {
        const candidate = calculateDiscountedPriceForVariant(variant.price, discount);
        if (candidate < bestPrice) {
            bestPrice = candidate;
        }
    }

    return {
        ...variant,
        effective_price: bestPrice !== variant.price ? bestPrice : undefined,
    };
};

export const getProductVariants = async (req, res, next) => {
    try {
        const { product_id } = req.query;

        let variantsRaw;
        if (product_id) {
            // Get variants for a specific product
            variantsRaw = await ProductVariantModel.findByProductId(parseInt(product_id));
        } else {
            // Get all variants (for admin dashboard)
            variantsRaw = await ProductVariantModel.findAll();
        }

        const variants = variantsRaw.map(applyDiscountsToVariant);

        res.status(200).json({
            success: true,
            message: 'Product variants fetched successfully',
            data: variants,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductVariantById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const variantId = parseInt(id);

        if (isNaN(variantId)) {
            throw new AppError('Invalid variant ID', 400);
        }

        const variantRaw = await ProductVariantModel.findById(variantId);

        if (!variantRaw) {
            throw new AppError('Product variant not found', 404);
        }

        const variant = applyDiscountsToVariant(variantRaw);

        res.status(200).json({
            success: true,
            message: 'Product variant fetched successfully',
            data: variant,
        });
    } catch (error) {
        next(error);
    }
};

export const createProductVariant = async (req, res, next) => {
    try {
        const { product_id, size, color, price, stock_quantity } = req.body;

        const newVariant = await ProductVariantModel.create({
            product_id: parseInt(product_id),
            size: size.trim(),
            color: color.trim(),
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity),
        });

        res.status(201).json({
            success: true,
            message: 'Product variant created successfully',
            data: newVariant,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductVariant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const variantId = parseInt(id);
        const { size, color, price, stock_quantity } = req.body;

        if (isNaN(variantId)) {
            throw new AppError('Invalid variant ID', 400);
        }

        const existingVariant = await ProductVariantModel.findById(variantId);
        if (!existingVariant) {
            throw new AppError('Product variant not found', 404);
        }

        const updateData = {};
        if (size !== undefined) updateData.size = size.trim();
        if (color !== undefined) updateData.color = color.trim();
        if (price !== undefined) updateData.price = parseFloat(price);
        if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);

        const updatedVariant = await ProductVariantModel.update(variantId, updateData);

        res.status(200).json({
            success: true,
            message: 'Product variant updated successfully',
            data: updatedVariant,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProductVariant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const variantId = parseInt(id);

        if (isNaN(variantId)) {
            throw new AppError('Invalid variant ID', 400);
        }

        const variant = await ProductVariantModel.findById(variantId);
        if (!variant) {
            throw new AppError('Product variant not found', 404);
        }

        await ProductVariantModel.delete(variantId);

        res.status(200).json({
            success: true,
            message: 'Product variant deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

