import { Router } from 'express';
import { createEquipment, updateEquipment, deleteEquipment, adjustEquipmentStock } from '../controllers/equipment.controller';
import { getAllBorrowRequests, rejectBorrowRequest, approveBorrowRequest } from '../controllers/borrow.controller';
import { getAllUsers, getUserById, deleteUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { getOverdueAlerts, sendReminder, getMyReminders } from '../controllers/alert.controller';
import { getTopBorrowedEquipment } from '../controllers/statistics.controller';

const router = Router();

router.post('/equipment', authMiddleware, isAdmin, createEquipment);
router.put('/equipment/:id', authMiddleware, isAdmin, updateEquipment);
router.delete('/equipment/:id', authMiddleware, isAdmin, deleteEquipment);
router.patch('/equipment/:id/adjust-stock', authMiddleware, isAdmin, adjustEquipmentStock);
router.get('/borrow-requests', authMiddleware, isAdmin, getAllBorrowRequests);
router.patch('/borrow-requests/:id/reject', authMiddleware, isAdmin, rejectBorrowRequest);
router.patch('/borrow-requests/:id/approve', authMiddleware, isAdmin, approveBorrowRequest);
router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.get('/users/:id', authMiddleware, isAdmin, getUserById);
router.delete('/users/:id', authMiddleware, isAdmin, deleteUser);
router.get('/overdue', authMiddleware, isAdmin, getOverdueAlerts);
router.post('/send-reminder/:id', authMiddleware, isAdmin, sendReminder);
router.get('/reminders/me', authMiddleware, isAdmin, getMyReminders);
router.get('/top-borrowed', authMiddleware, isAdmin, getTopBorrowedEquipment);

export default router;
