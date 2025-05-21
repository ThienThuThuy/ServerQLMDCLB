// src/routes/statistics.routes.ts
import express from 'express';
import { getTopBorrowedEquipment } from '../controllers/statistics.controller';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// GET /api/statistics/top-borrowed
router.get('/top-borrowed', authMiddleware, isAdmin, getTopBorrowedEquipment);

export default router;
