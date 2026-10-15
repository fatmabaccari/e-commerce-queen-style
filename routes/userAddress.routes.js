import { Router } from "express";
import {
    getUserAddresses,
    getUserAddressById,
    createUserAddress,
    updateUserAddress,
    deleteUserAddress,
} from "../controllers/userAddress.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOwnership } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const userAddressRouter = Router();

// All routes require authentication
userAddressRouter.use(authenticate);

// GET /api/v1/user-addresses - Get all user addresses
userAddressRouter.get('/', asyncHandler(getUserAddresses));

// GET /api/v1/user-addresses/:id - Get address by ID
userAddressRouter.get('/:id', checkOwnership('user_addresses'), asyncHandler(getUserAddressById));

// POST /api/v1/user-addresses - Create new address
userAddressRouter.post('/', asyncHandler(createUserAddress));

// PUT /api/v1/user-addresses/:id - Update address
userAddressRouter.put('/:id', checkOwnership('user_addresses'), asyncHandler(updateUserAddress));

// DELETE /api/v1/user-addresses/:id - Delete address
userAddressRouter.delete('/:id', checkOwnership('user_addresses'), asyncHandler(deleteUserAddress));

export default userAddressRouter;

