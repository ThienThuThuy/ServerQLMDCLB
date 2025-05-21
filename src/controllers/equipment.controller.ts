// src/controllers/device.controller.ts
import { Request, Response } from 'express';
import EquipmentModel from '../models/equipment.model';

export const getEquipment = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        const query: any = {};

        if (status && typeof status === 'string') {
            query.status = status;
        }

        const devices = await EquipmentModel.find(query);

        res.status(200).json({
            message: 'Devices fetched successfully',
            data: devices,
        });
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const createEquipment = async (req: Request, res: Response) => {
    try {
        const {
            name,
            full_name,
            serial_number,
            quantity,
            description,
        } = req.body;

        // Kiểm tra serial_number đã tồn tại chưa
        const existing = await EquipmentModel.findOne({ serial_number });
        if (existing) {
            res.status(400).json({ message: 'Serial number already exists.' });
            return;
        }

        const newDevice = await EquipmentModel.create({
            name,
            full_name,
            serial_number,
            quantity,
            description,
            status: 'available', // mặc định
        });

        res.status(201).json({
            message: 'Equipment created successfully.',
            data: newDevice,
        });
    } catch (error) {
        console.error('Create equipment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getEquipmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const equipment = await EquipmentModel.findById(id);

        if (!equipment) {
            res.status(404).json({ message: 'Equipment not found.' });
            return;
        }

        res.status(200).json({
            message: 'Equipment fetched successfully.',
            data: equipment,
        });
    } catch (error) {
        console.error('Get equipment by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await EquipmentModel.findByIdAndUpdate(id, updateData, {
            new: true, // trả về bản ghi đã cập nhật
            runValidators: true, // kiểm tra điều kiện trong schema
        });

        if (!updated) {
            res.status(404).json({ message: 'Equipment not found.' });
            return;
        }

        res.status(200).json({
            message: 'Equipment updated successfully.',
            data: updated,
        });
    } catch (error) {
        console.error('Update equipment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deleted = await EquipmentModel.findByIdAndDelete(id);

        if (!deleted) {
            res.status(404).json({ message: 'Equipment not found.' });
            return;
        }

        res.status(200).json({
            message: 'Equipment deleted successfully.',
            data: deleted,
        });
    } catch (error) {
        console.error('Delete equipment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const adjustEquipmentStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { adjustment } = req.body;

        if (typeof adjustment !== 'number') {
            res.status(400).json({ message: 'Adjustment must be a number.' });
            return;
        }

        const equipment = await EquipmentModel.findById(id);

        if (!equipment) {
            res.status(404).json({ message: 'Equipment not found.' });
            return;
        }

        const newQuantity = equipment.quantity + adjustment;

        if (newQuantity < 0) {
            res.status(400).json({ message: 'Quantity cannot be negative.' });
            return;
        }

        equipment.quantity = newQuantity;
        await equipment.save();

        res.status(200).json({
            message: 'Stock adjusted successfully.',
            data: equipment,
        });
    } catch (error) {
        console.error('Adjust stock error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};