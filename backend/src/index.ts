import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import songRoutes from './routes/songs';
import artistRoutes from './routes/artists';
import albumRoutes from './routes/albums';
import playlistRoutes from './routes/playlists';
import searchRoutes from './routes/search';
import chartsRoutes from './routes/charts';
import opportunityRoutes from './routes/opportunities';
import serviceRoutes from './routes/services';
import analyticsRoutes from './routes/analytics';
import financeRoutes from './routes/finance';
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import postRoutes from './routes/posts';
import messageRoutes from './routes/messages';

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

function isPayuOrigin(origin: string) {
    try {
        const hostname = new URL(origin).hostname.toLowerCase();
        return hostname === 'test.payu.in' || hostname === 'apitest.payu.in' || hostname.endsWith('.payu.in');
    } catch {
        return false;
    }
}

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || isPayuOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', platform: 'Bouut Music API' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/charts', chartsRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🎵 Bouut Music API running at http://localhost:${PORT}`);
});

export default app;
