import express, { Request, Response } from 'express';
import { connectDB, disconnectDB } from './config/database';
import authRoutes from './routers/auth.routes';
import userRoutes from './routers/user.routes';
import equipmentRoutes from './routers/equipment.routes';
import borrowRoutes from './routers/borrow.routes';
import statisticsRoutes from './routers/statistics.routes';
import alertRoutes from './routers/alert.routes';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', equipmentRoutes);
app.use('/api', borrowRoutes);
app.use('/api', statisticsRoutes);
app.use('/api', alertRoutes);
// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔻 Gracefully shutting down...');
    await disconnectDB();
    process.exit(0);
});
