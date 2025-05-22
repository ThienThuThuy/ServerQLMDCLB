// src/routes/alert.routes.ts
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { registerUser, loginUser } from '../controllers/auth.controller';
import { createBorrowRequest, getBorrowRequestById, getMyBorrowRequests } from '../controllers/borrow.controller';
import { getEquipment, getEquipmentById } from '../controllers/equipment.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/borrow-requests', authMiddleware, createBorrowRequest);
router.get('/borrow-requests/:id', authMiddleware, getBorrowRequestById);
router.get('/borrow-requests/me', authMiddleware, getMyBorrowRequests);
router.get('/equipment', getEquipment);
router.get('/equipment/:id', getEquipmentById);
export default router;










