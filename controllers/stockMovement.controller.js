import StockMovementModel from '../models/stockMovement.model.js';
import ProductVariantModel from '../models/productVariant.model.js';
import AppError from '../middlewares/AppError.js';

export const getStockMovements = async (req, res, next) => {
    try {
        const { variant_id, admin_id } = req.query;
        const filters = {};
        
        if (variant_id) filters.variant_id = parseInt(variant_id);
        if (admin_id) filters.admin_id = parseInt(admin_id);

        const movements = await StockMovementModel.findAll(filters);

        res.status(200).json({
            success: true,
            message: 'Stock movements fetched successfully',
            data: movements,
        });
    } catch (error) {
        next(error);
    }
};

export const getStockMovementById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const movementId = parseInt(id);

        if (isNaN(movementId)) {
            throw new AppError('Invalid stock movement ID', 400);
        }

        const movement = await StockMovementModel.findById(movementId);

        if (!movement) {
            throw new AppError('Stock movement not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Stock movement fetched successfully',
            data: movement,
        });
    } catch (error) {
        next(error);
    }
};

export const createStockMovement = async (req, res, next) => {
    try {
        // Only admins can create stock movements
        if (!req.user.admin) {
            throw new AppError('Access denied. Only admins can create stock movements.', 403);
        }

        const { variant_id, change_amount, reason } = req.body;

        // Check if variant exists
        const variant = await ProductVariantModel.findById(variant_id);
        if (!variant) {
            throw new AppError('Product variant not found', 404);
        }

        // Check if stock would go negative
        if (variant.stock_quantity + change_amount < 0) {
            throw new AppError('Insufficient stock. Cannot reduce stock below zero.', 400);
        }

        // Create stock movement
        const movement = await StockMovementModel.create({
            variant_id: parseInt(variant_id),
            change_amount: parseInt(change_amount),
            reason: reason.trim(),
            admin_id: req.user.userId,
        });

        // Update variant stock
        await ProductVariantModel.updateStock(variant_id, change_amount);

        res.status(201).json({
            success: true,
            message: 'Stock movement created successfully',
            data: movement,
        });
    } catch (error) {
        next(error);
    }
};

