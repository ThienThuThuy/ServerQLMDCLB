import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import UserModel from '../models/user.model';
import mongoose from 'mongoose';
export const getMe = (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        res.status(200).json({
            message: 'User profile fetched successfully.',
            user: req.user,
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.find().select('-password -__v'); // Exclude password and version key

        res.status(200).json({
            message: 'Fetched user list successfully',
            data: users,
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const user = await UserModel.findById(id).select('-password -__v');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Only allow admin or the user themselves to access the profile
        const isAdmin = req.user.role === 'admin';
        const isSelf = req.user._id.toString() === id;

        if (!isAdmin && !isSelf) {
            res.status(403).json({ message: 'Forbidden: Access denied' });
            return;
        }

        res.status(200).json({
            message: 'User fetched successfully',
            data: user,
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        // Check authentication
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        // Prevent users from deleting themselves (optional business rule)
        if (req.user._id.toString() === id) {
            res.status(403).json({ message: 'Cannot delete your own account' });
            return;
        }

        // Only allow admins to delete users
        if (req.user.role !== 'admin') {
            res.status(403).json({ message: 'Forbidden: Only admin can delete users' });
            return;
        }

        const deletedUser = await UserModel.findByIdAndDelete(id).select('-password -__v');

        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            message: 'User deleted successfully',
            data: {
                _id: deletedUser._id,
                email: deletedUser.email,
                role: deletedUser.role,
                // Include other non-sensitive fields as needed
            },
        });
    } catch (error) {
        console.error('Delete user error:', error);

        // Handle specific errors
        if (error instanceof mongoose.Error.CastError) {
            res.status(400).json({ message: 'Invalid user ID format' });
            return;
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};