import { Router } from "express";
import { 
    getUserById, 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser 
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOwnershipOrAdmin } from "../middlewares/auth.middleware.js";
import { validateUserUpdate } from "../middlewares/validation.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const userRouter = Router();

// GET /api/v1/users - Get all users (requires authentication, admin only)
userRouter.get('/', authenticate, asyncHandler(getUsers));

// GET /api/v1/users/:id - Get user by ID (requires authentication, can only access own profile unless admin)
userRouter.get('/:id', authenticate, asyncHandler(getUserById));

// POST /api/v1/users - Create user (redirects to sign-up)
userRouter.post('/', asyncHandler(createUser));

// PUT /api/v1/users/:id - Update user (requires authentication, can only update own profile unless admin)
userRouter.put('/:id', authenticate, checkOwnershipOrAdmin('users'), validateUserUpdate, asyncHandler(updateUser));

// DELETE /api/v1/users/:id - Delete user (requires authentication, can only delete own profile unless admin)
userRouter.delete('/:id', authenticate, checkOwnershipOrAdmin('users'), asyncHandler(deleteUser));

export default userRouter;