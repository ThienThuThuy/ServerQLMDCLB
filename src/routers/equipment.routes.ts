import express from 'express';
import {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    adjustEquipmentStock,// 👈 Thêm dòng này
} from '../controllers/equipment.controller';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// GET
router.get('/equipment', getEquipment);
router.get('/equipment/:id', getEquipmentById);

// POST
router.post('/equipment', authMiddleware, isAdmin, createEquipment);

// PUT
router.put('/equipment/:id', authMiddleware, isAdmin, updateEquipment);

// ✅ DELETE
router.delete('/equipment/:id', authMiddleware, isAdmin, deleteEquipment);
router.patch('/equipment/:id/adjust-stock', authMiddleware, isAdmin, adjustEquipmentStock);
export default router;
