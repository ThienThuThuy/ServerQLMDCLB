import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import UserModel from '../models/user.model';
import mongoose from 'mongoose';
import path from 'path';

// Common error messages
const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden: Access denied',
    NOT_FOUND: 'User not found',
    SELF_DELETE: 'Cannot delete your own account',
    ADMIN_ONLY: 'Forbidden: Only admin can perform this action',
    NO_FILE: 'No file uploaded',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_ID: 'Invalid user ID format',
};

// Common success messages
const SUCCESS_MESSAGES = {
    PROFILE_FETCHED: 'User profile fetched successfully',
    USERS_FETCHED: 'Fetched user list successfully',
    USER_FETCHED: 'User fetched successfully',
    USER_DELETED: 'User deleted successfully',
    AVATAR_UPLOADED: 'Avatar uploaded successfully',
};

/**
 * Get current user's profile
 */
export const getMe = (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
            return;
        }

        res.status(200).json({
            message: SUCCESS_MESSAGES.PROFILE_FETCHED,
            user: req.user,
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        // Check if user is admin
        if (!req.user || req.user.role !== 'admin') {
            res.status(403).json({ message: ERROR_MESSAGES.ADMIN_ONLY });
            return;
        }

        const users = await UserModel.find().select('-password -__v -refreshToken');

        res.status(200).json({
            message: SUCCESS_MESSAGES.USERS_FETCHED,
            data: users,
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
            return;
        }

        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: ERROR_MESSAGES.INVALID_ID });
            return;
        }

        const user = await UserModel.findById(id).select('-password -__v -refreshToken');

        if (!user) {
            res.status(404).json({ message: ERROR_MESSAGES.NOT_FOUND });
            return;
        }

        // Authorization check
        const isAdmin = req.user.role === 'admin';
        const isSelf = (req.user as { _id: mongoose.Types.ObjectId })._id.toString() === id;

        if (!isAdmin && !isSelf) {
            res.status(403).json({ message: ERROR_MESSAGES.FORBIDDEN });
            return;
        }

        res.status(200).json({
            message: SUCCESS_MESSAGES.USER_FETCHED,
            data: user,
        });
    } catch (error) {
        console.error('Get user by ID error:', error);

        if (error instanceof mongoose.Error.CastError) {
            res.status(400).json({ message: ERROR_MESSAGES.INVALID_ID });
            return;
        }

        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
            return;
        }

        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: ERROR_MESSAGES.INVALID_ID });
            return;
        }

        // Prevent self-deletion
        if ((req.user as { _id: mongoose.Types.ObjectId })._id.toString() === id) {
            res.status(403).json({ message: ERROR_MESSAGES.SELF_DELETE });
            return;
        }

        // Admin check
        if (req.user.role !== 'admin') {
            res.status(403).json({ message: ERROR_MESSAGES.ADMIN_ONLY });
            return;
        }

        const deletedUser = await UserModel.findByIdAndDelete(id).select('-password -__v -refreshToken');

        if (!deletedUser) {
            res.status(404).json({ message: ERROR_MESSAGES.NOT_FOUND });
            return;
        }

        res.status(200).json({
            message: SUCCESS_MESSAGES.USER_DELETED,
            data: {
                _id: deletedUser._id,
                email: deletedUser.email,
                role: deletedUser.role,
                name: deletedUser.username,
                avatar: deletedUser.avatar,
            },
        });
    } catch (error) {
        console.error('Delete user error:', error);

        if (error instanceof mongoose.Error.CastError) {
            res.status(400).json({ message: ERROR_MESSAGES.INVALID_ID });
            return;
        }

        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
};

/**
 * Upload user avatar
 */
