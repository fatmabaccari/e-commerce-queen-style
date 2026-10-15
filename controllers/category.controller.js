import CategoryModel from '../models/category.model.js';
import AppError from '../middlewares/AppError.js';

export const getCategories = async (req, res, next) => {
    try {
        const { include_products } = req.query;
        const includeProducts = include_products === 'true';

        const categories = await CategoryModel.findAll(includeProducts);

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            throw new AppError('Invalid category ID', 400);
        }

        const category = await CategoryModel.findById(categoryId);

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Category fetched successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const { name, description, parent_id } = req.body;

        const newCategory = await CategoryModel.create({
            name: name.trim(),
            description: description ? description.trim() : null,
            parent_id: parent_id ? parseInt(parent_id) : null,
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);
        const { name, description, parent_id } = req.body;

        if (isNaN(categoryId)) {
            throw new AppError('Invalid category ID', 400);
        }

        const existingCategory = await CategoryModel.findById(categoryId);
        if (!existingCategory) {
            throw new AppError('Category not found', 404);
        }

        // Prevent circular reference
        if (parent_id === categoryId) {
            throw new AppError('Category cannot be its own parent', 400);
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (parent_id !== undefined) updateData.parent_id = parent_id ? parseInt(parent_id) : null;

        const updatedCategory = await CategoryModel.update(categoryId, updateData);

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            throw new AppError('Invalid category ID', 400);
        }

        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        await CategoryModel.delete(categoryId);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

