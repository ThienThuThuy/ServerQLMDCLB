// src/routes/alert.routes.ts
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { getOverdueAlerts, sendReminder, getMyReminders } from '../controllers/alert.controller';

const router = express.Router();

router.get('/overdue', authMiddleware, isAdmin, getOverdueAlerts);
router.post('/send-reminder/:id', authMiddleware, isAdmin, sendReminder);
router.get('/reminders/me', authMiddleware, isAdmin, getMyReminders);

export default router;
