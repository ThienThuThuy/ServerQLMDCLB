// src/controllers/borrowRequest.controller.ts
import { Request, Response } from 'express';
import BorrowRequestModel from '../models/borrow.model';
import EquipmentModel from '../models/equipment.model';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const createBorrowRequest = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user._id;
        const { equipment, quantity, reason, dueDate } = req.body; // Add dueDate from request body

        // Validate required fields
        if (!dueDate) {
            res.status(400).json({ message: 'Due date is required.' });
            return;
        }

        // Kiểm tra thiết bị tồn tại
        const equipmentData = await EquipmentModel.findById(equipment);
        if (!equipmentData) {
            res.status(404).json({ message: 'Equipment not found.' });
            return;
        }

        if (equipmentData.quantity < quantity) {
            res.status(400).json({ message: 'Not enough equipment in stock.' });
            return;
        }

        const newRequest = await BorrowRequestModel.create({
            user: userId,
            equipment,
            quantity,
            reason,
            dueDate: new Date(dueDate), // Ensure it's a Date object
            status: 'pending',
        });

        res.status(201).json({
            message: 'Borrow request submitted successfully.',
            request: newRequest,
        });
    } catch (error) {
        console.error('Create borrow request error:', error);

        // Handle specific validation errors
        if (error instanceof mongoose.Error.ValidationError) {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ message: 'Validation error', errors: messages });
            return;
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllBorrowRequests = async (req: Request, res: Response) => {
    try {
        const requests = await BorrowRequestModel.find()
            .populate('user', 'first_name last_name email')
            .populate('equipment', 'name serial_number')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Borrow requests fetched successfully.',
            data: requests,
        });
    } catch (error) {
        console.error('Get borrow requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBorrowRequestById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const user = req.user;

        const request = await BorrowRequestModel.findById(id)
            .populate('user', 'first_name last_name email role')
            .populate('equipment', 'name serial_number');

        if (!request) {
            res.status(404).json({ message: 'Borrow request not found' });
            return;
        }

        const isAdmin = user.role === 'admin';
        const isOwner = request.user && request.user._id.toString() === user._id.toString();

        if (!isAdmin && !isOwner) {
            res.status(403).json({ message: 'Forbidden: Access denied' });
            return;
        }

        res.status(200).json({
            message: 'Borrow request fetched successfully',
            data: request,
        });
    } catch (error) {
        console.error('Get borrow request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const rejectBorrowRequest = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const user = req.user;

        // Chỉ admin mới được từ chối yêu cầu
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Forbidden: Only admin can reject requests' });
            return;
        }

        const request = await BorrowRequestModel.findById(id);
        if (!request) {
            res.status(404).json({ message: 'Borrow request not found' });
            return;
        }

        if (request.status === 'rejected') {
            res.status(400).json({ message: 'Request is already rejected' });
            return;
        }

        request.status = 'rejected';
        await request.save();

        res.status(200).json({
            message: 'Borrow request rejected successfully',
            data: request,
        });
    } catch (error) {
        console.error('Reject borrow request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const approveBorrowRequest = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const user = req.user;

        // Chỉ admin mới được duyệt yêu cầu
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Forbidden: Only admin can approve requests' });
            return;
        }

        const request = await BorrowRequestModel.findById(id).populate('equipment');
        if (!request) {
            res.status(404).json({ message: 'Borrow request not found' });
            return;
        }

        if (request.status !== 'pending') {
            res.status(400).json({ message: `Cannot approve a ${request.status} request.` });
            return;
        }

        const equipment = request.equipment as any;

        // Kiểm tra số lượng thiết bị khả dụng
        if (equipment.quantity < request.quantity) {
            res.status(400).json({ message: 'Not enough equipment in stock.' });
            return;
        }

        // Cập nhật số lượng thiết bị và trạng thái yêu cầu (Transaction để đảm bảo atomicity)
        await mongoose.startSession().then(async (session) => {
            session.startTransaction();
            try {
                equipment.quantity -= request.quantity;
                await equipment.save({ session });

                request.status = 'approved';
                request.approvedAt = new Date();
                await request.save({ session });

                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        });

        res.status(200).json({
            message: 'Borrow request approved successfully.',
            data: request,

        });
    } catch (error) {
        console.error('Approve borrow request error:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
};

export const getMyBorrowRequests = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user._id;
        const requests = await BorrowRequestModel.find({ user: userId })
            .populate('equipment', 'name serial_number')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Your borrow requests fetched successfully',
            data: requests,
        });
    } catch (error) {
        console.error('Get my borrow requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};