// src/routes/borrowRequest.routes.ts
import express from 'express';
import { createBorrowRequest, getAllBorrowRequests, getBorrowRequestById, rejectBorrowRequest, approveBorrowRequest, getMyBorrowRequests } from '../controllers/borrow.controller';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// POST /api/borrow-requests
router.post('/borrow-requests', authMiddleware, createBorrowRequest);
router.get('/borrow-requests', authMiddleware, isAdmin, getAllBorrowRequests);
router.get('/borrow-requests/:id', authMiddleware, getBorrowRequestById);
router.patch('/borrow-requests/:id/reject', authMiddleware, isAdmin, rejectBorrowRequest);
router.patch('/borrow-requests/:id/approve', authMiddleware, isAdmin, approveBorrowRequest);
router.get('/borrow-requests/me', authMiddleware, getMyBorrowRequests);

export default router;
