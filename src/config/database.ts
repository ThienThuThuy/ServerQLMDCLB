import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Kiểm tra cả MONGODB_URI và MONGODB_DB_NAME
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI || !MONGODB_DB_NAME) {
    throw new Error('MONGODB_URI or MONGODB_DB_NAME not defined in .env file');
}

export const connectDB = async () => {
    try {
        // Kết nối đến MongoDB sử dụng cả URI và tên cơ sở dữ liệu
        await mongoose.connect(MONGODB_URI, {
            dbName: MONGODB_DB_NAME,  // Đảm bảo sử dụng dbName nếu cần
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error disconnecting from MongoDB:', err);
    }
};
