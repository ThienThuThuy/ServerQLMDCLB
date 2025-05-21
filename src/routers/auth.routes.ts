import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
