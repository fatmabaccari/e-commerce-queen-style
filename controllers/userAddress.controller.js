import UserAddressModel from '../models/userAddress.model.js';
import AppError from '../middlewares/AppError.js';

export const getUserAddresses = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const addresses = await UserAddressModel.findByUserId(userId);
        
        res.status(200).json({
            success: true,
            message: 'Addresses fetched successfully',
            data: addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserAddressById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const addressId = parseInt(id);
        const userId = req.user.userId;

        if (isNaN(addressId)) {
            throw new AppError('Invalid address ID', 400);
        }

        const address = await UserAddressModel.findById(addressId);

        if (!address) {
            throw new AppError('Address not found', 404);
        }

        // Check ownership
        if (address.user_id !== userId) {
            throw new AppError('Access denied. You can only access your own addresses.', 403);
        }

        res.status(200).json({
            success: true,
            message: 'Address fetched successfully',
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const createUserAddress = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { full_name, phone, address, city, note } = req.body;

        const newAddress = await UserAddressModel.create({
            user_id: userId,
            full_name,
            phone,
            address,
            city,
            note: note || null,
        });

        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: newAddress,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const addressId = parseInt(id);
        const userId = req.user.userId;
        const { full_name, phone, address, city, note } = req.body;

        if (isNaN(addressId)) {
            throw new AppError('Invalid address ID', 400);
        }

        const existingAddress = await UserAddressModel.findById(addressId);
        if (!existingAddress) {
            throw new AppError('Address not found', 404);
        }

        // Check ownership
        if (existingAddress.user_id !== userId) {
            throw new AppError('Access denied. You can only update your own addresses.', 403);
        }

        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (address !== undefined) updateData.address = address.trim();
        if (city !== undefined) updateData.city = city.trim();
        if (note !== undefined) updateData.note = note ? note.trim() : null;

        const updatedAddress = await UserAddressModel.update(addressId, updateData);

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: updatedAddress,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUserAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const addressId = parseInt(id);
        const userId = req.user.userId;

        if (isNaN(addressId)) {
            throw new AppError('Invalid address ID', 400);
        }

        const address = await UserAddressModel.findById(addressId);
        if (!address) {
            throw new AppError('Address not found', 404);
        }

        // Check ownership
        if (address.user_id !== userId) {
            throw new AppError('Access denied. You can only delete your own addresses.', 403);
        }

        await UserAddressModel.delete(addressId);

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

