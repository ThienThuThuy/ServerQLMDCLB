// src/controllers/statistics.controller.ts
import { Request, Response } from 'express';
import BorrowRequestModel from '../models/borrow.model';
import EquipmentModel from '../models/equipment.model';
import mongoose from 'mongoose';

export const getTopBorrowedEquipment = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const topBorrowed = await BorrowRequestModel.aggregate([
            {
                $match: {
                    status: 'approved',
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            {
                $group: {
                    _id: '$equipment',
                    totalBorrowed: { $sum: '$quantity' },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { totalBorrowed: -1 },
            },
            {
                $limit: 5,
            },
            {
                $lookup: {
                    from: 'equipment', // collection name in MongoDB
                    localField: '_id',
                    foreignField: '_id',
                    as: 'equipmentInfo',
                },
            },
            {
                $unwind: '$equipmentInfo',
            },
            {
                $project: {
                    _id: 0,
                    equipmentId: '$equipmentInfo._id',
                    name: '$equipmentInfo.name',
                    serial_number: '$equipmentInfo.serial_number',
                    totalBorrowed: 1,
                    requestCount: '$count',
                },
            },
        ]);

        res.status(200).json({
            message: 'Top borrowed equipment fetched successfully',
            data: topBorrowed,
        });
    } catch (error) {
        console.error('Statistic error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
