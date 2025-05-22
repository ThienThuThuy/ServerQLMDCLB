import express, { Request, Response } from 'express';
import path from 'path';
import { connectDB, disconnectDB } from './config/database';
import userRoutes from './routers/user.routes';
import adminRoutes from './routers/admin.routes'
import Routes from './routers/index.routes';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', Routes);
app.use('uploads', express.static(path.join(__dirname, 'uploads')));

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
