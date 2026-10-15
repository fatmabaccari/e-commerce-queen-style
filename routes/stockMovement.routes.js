import { Router } from "express";
import {
    getStockMovements,
    getStockMovementById,
    createStockMovement,
} from "../controllers/stockMovement.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const stockMovementRouter = Router();

// All routes require admin authentication
stockMovementRouter.use(authenticate);
stockMovementRouter.use(authorize(['admin', 'super_admin']));

// GET /api/v1/stock-movements - Get all stock movements
stockMovementRouter.get('/', asyncHandler(getStockMovements));

// GET /api/v1/stock-movements/:id - Get stock movement by ID
stockMovementRouter.get('/:id', asyncHandler(getStockMovementById));

// POST /api/v1/stock-movements - Create stock movement
stockMovementRouter.post('/', asyncHandler(createStockMovement));

export default stockMovementRouter;

