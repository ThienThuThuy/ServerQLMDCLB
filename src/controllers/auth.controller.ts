import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user.model';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            first_name,
            last_name,
            email,
            username,
            password,
            contact,
            position = 'Employee',
            // role không lấy từ req.body
        } = req.body;

        // Kiểm tra trùng email hoặc username
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            res.status(400).json({
                message: 'Email or username already exists.',
            });
            return;
        }

        // Băm mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới, luôn set role là 'user'
        const newUser = new UserModel({
            first_name,
            last_name,
            email,
            username,
            password: hashedPassword,
            contact,
            position,
            role: 'user',
        });

        const savedUser = await newUser.save();

        // Chỉ trả về các trường cần thiết (loại bỏ password)
        const { password: _, ...userWithoutPassword } = savedUser.toObject();

        res.status(201).json({
            message: 'User registered successfully.',
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            res.status(400).json({
                success: false,
                message: 'Email/Username and password are required.'
            });
            return;
        }

        // Find user by email or username
        const user = await UserModel.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        });

        // Return generic error message for security
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};