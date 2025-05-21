import { Router } from 'express';
import { getMe, getAllUsers, getUserById, deleteUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
const router = Router();

function asyncHandler(fn: any) {
    return function (req: any, res: any, next: any) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

router.get('/me', authMiddleware, asyncHandler(getMe));
router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.get('/users/:id', authMiddleware, isAdmin, getUserById);
router.delete('/users/:id', authMiddleware, isAdmin, deleteUser);

export default router;
