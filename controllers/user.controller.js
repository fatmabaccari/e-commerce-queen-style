import UserModel from '../models/user.model.js';
import AppError from '../middlewares/AppError.js';

export const getUsers = async (req, res, next) => { 
    try {
        const users = await UserModel.findAll();
        
        // Remove password_hash from all users
        const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user);
        
        res.status(200).json({ 
            success: true, 
            message: 'Users fetched successfully', 
            data: usersWithoutPasswords 
        });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => { 
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        
        if (isNaN(userId)) {
            throw new AppError('Invalid user ID', 400);
        }
        
        const user = await UserModel.findById(userId);
        
        if (!user) {
            throw new AppError('User not found', 404);
        }
        
        // Remove password_hash from response
        const { password_hash, ...userWithoutPassword } = user;
        
        res.status(200).json({ 
            success: true, 
            message: 'User fetched successfully', 
            data: userWithoutPassword 
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        // This should typically be done through sign-up
        // But if needed for admin purposes, it can be implemented here
        throw new AppError('Use /api/v1/auth/sign-up to create a new user', 400);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const { first_name, last_name, phone } = req.body;
        
        if (isNaN(userId)) {
            throw new AppError('Invalid user ID', 400);
        }
        
        // Check if user exists
        const existingUser = await UserModel.findById(userId);
        if (!existingUser) {
            throw new AppError('User not found', 404);
        }
        
        // Prepare update data (only allow updating specific fields)
        const updateData = {};
        if (first_name !== undefined) updateData.first_name = first_name.trim();
        if (last_name !== undefined) updateData.last_name = last_name.trim();
        if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
        
        if (Object.keys(updateData).length === 0) {
            throw new AppError('No valid fields to update', 400);
        }
        
        const updatedUser = await UserModel.update(userId, updateData);
        
        // Remove password_hash from response
        const { password_hash, ...userWithoutPassword } = updatedUser;
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: userWithoutPassword,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        
        if (isNaN(userId)) {
            throw new AppError('Invalid user ID', 400);
        }
        
        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        
        await UserModel.delete(userId);
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};