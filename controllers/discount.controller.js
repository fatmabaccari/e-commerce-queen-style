import DiscountModel from '../models/discount.model.js';
import AppError from '../middlewares/AppError.js';

export const getDiscounts = async (req, res, next) => {
    try {
        const { active_only } = req.query;
        
        const discounts = active_only === 'true' 
            ? await DiscountModel.findActive()
            : await DiscountModel.findAll();

        res.status(200).json({
            success: true,
            message: 'Discounts fetched successfully',
            data: discounts,
        });
    } catch (error) {
        next(error);
    }
};

export const getDiscountById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const discountId = parseInt(id);

        if (isNaN(discountId)) {
            throw new AppError('Invalid discount ID', 400);
        }

        const discount = await DiscountModel.findById(discountId);

        if (!discount) {
            throw new AppError('Discount not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Discount fetched successfully',
            data: discount,
        });
    } catch (error) {
        next(error);
    }
};

export const createDiscount = async (req, res, next) => {
    try {
        const { name, type, value, start_date, end_date, category_ids, product_ids } = req.body;

        console.log('Creating discount with data:', {
            name,
            type,
            value,
            start_date,
            end_date,
            category_ids,
            product_ids,
            category_ids_type: typeof category_ids,
            product_ids_type: typeof product_ids,
        });

        // Normalize arrays - handle both array and single value cases
        const normalizedCategoryIds = category_ids 
            ? (Array.isArray(category_ids) ? category_ids : [category_ids]).filter(id => id != null)
            : [];
        const normalizedProductIds = product_ids 
            ? (Array.isArray(product_ids) ? product_ids : [product_ids]).filter(id => id != null)
            : [];

        // Validate that at least one target is selected (category or product)
        if (normalizedCategoryIds.length === 0 && normalizedProductIds.length === 0) {
            throw new AppError('Please select at least one category or product to apply the discount to', 400);
        }

        // Type validation and normalization is handled by validateDiscount middleware
        const discount = await DiscountModel.create({
            name: name.trim(),
            type, // Already normalized by middleware
            value: parseFloat(value),
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            category_ids: normalizedCategoryIds.length > 0 ? normalizedCategoryIds : undefined,
            product_ids: normalizedProductIds.length > 0 ? normalizedProductIds : undefined,
        });

        res.status(201).json({
            success: true,
            message: 'Discount created successfully',
            data: discount,
        });
    } catch (error) {
        console.error('Error creating discount:', error);
        console.error('Error stack:', error.stack);
        next(error);
    }
};

export const updateDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const discountId = parseInt(id);
        const { name, type, value, start_date, end_date, category_ids, product_ids } = req.body;

        if (isNaN(discountId)) {
            throw new AppError('Invalid discount ID', 400);
        }

        const existingDiscount = await DiscountModel.findById(discountId);
        if (!existingDiscount) {
            throw new AppError('Discount not found', 404);
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (type !== undefined) {
            // Type validation and normalization is handled by validateDiscount middleware
            updateData.type = type; // Already normalized by middleware
        }
        if (value !== undefined) updateData.value = parseFloat(value);
        if (start_date !== undefined) updateData.start_date = new Date(start_date);
        if (end_date !== undefined) updateData.end_date = new Date(end_date);
        
        // Handle category and product relationships
        if (category_ids !== undefined) {
            updateData.category_ids = Array.isArray(category_ids) ? category_ids : (category_ids ? [category_ids] : []);
        }
        if (product_ids !== undefined) {
            updateData.product_ids = Array.isArray(product_ids) ? product_ids : (product_ids ? [product_ids] : []);
        }

        const updatedDiscount = await DiscountModel.update(discountId, updateData);

        res.status(200).json({
            success: true,
            message: 'Discount updated successfully',
            data: updatedDiscount,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteDiscount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const discountId = parseInt(id);

        if (isNaN(discountId)) {
            throw new AppError('Invalid discount ID', 400);
        }

        const discount = await DiscountModel.findById(discountId);
        if (!discount) {
            throw new AppError('Discount not found', 404);
        }

        await DiscountModel.delete(discountId);

        res.status(200).json({
            success: true,
            message: 'Discount deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

