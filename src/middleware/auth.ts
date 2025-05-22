import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const user = await UserModel.findById(decoded.userId).select('-password');

        if (!user) {
            res.status(401).json({ message: 'Unauthorized: User not found' });
            return;
        }

        req.user = user; // ✅ Gán user vào req để các route sau dùng được
        next();
    } catch (error) {
        console.error('Token error:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }
};

// src/middleware/isAdmin.ts

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied: Admins only.' });
        return;
    }

    next();
};
