// src/controllers/alert.controller.ts
import { Request, Response } from 'express';
import BorrowRequestModel from '../models/borrow.model';
import ReminderModel from '../models/reminder.model';
import { AuthRequest } from '../middleware/auth';
export const getOverdueAlerts = async (req: Request, res: Response) => {
    try {
        const today = new Date();

        const overdueRequests = await BorrowRequestModel.find({
            status: 'approved',
            dueDate: { $lt: today }
        })
            .populate('user', 'first_name last_name email')
            .populate('equipment', 'name serial_number');

        res.status(200).json({
            message: 'Overdue borrow requests fetched successfully',
            data: overdueRequests,
        });
    } catch (error) {
        console.error('Overdue alert error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const sendReminder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const borrowRequest = await BorrowRequestModel.findById(id).populate('user');

        if (!borrowRequest) {
            res.status(404).json({ message: 'Borrow request not found' });
            return;
        }

        const message = `⚠️ Bạn có thiết bị "${borrowRequest.equipment}" chưa trả. Vui lòng hoàn trả sớm.`;

        await ReminderModel.create({
            user: borrowRequest.user._id,
            message,
        });

        res.status(200).json({ message: 'Reminder sent successfully' });
    } catch (error) {
        console.error('Send reminder error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyReminders = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const reminders = await ReminderModel.find({ user: req.user._id, seen: false });

        res.status(200).json({ data: reminders });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};