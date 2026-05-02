import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
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
import adminNotificationRoutes from './routes/adminNotifications';
import adminSupportRoutes from './routes/adminSupport';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import postRoutes from './routes/posts';
import messageRoutes from './routes/messages';
import supportRoutes from './routes/support';
import { getUploadRootDir } from './utils/media';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const uploadRootDir = getUploadRootDir();

function normalizeOrigin(origin: string) {
    return origin
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/\/+$/, '');
}

const defaultAllowedOrigins = [
    'https://bouutmusic.com',
    'https://www.bouutmusic.com',
    'http://localhost:3000',
    'http://localhost:3001',
];
const configuredOrigins = `${process.env.FRONTEND_URLS || ''},${process.env.FRONTEND_URL || ''}`;
const allowedOrigins = (configuredOrigins || defaultAllowedOrigins.join(','))
    .split(',')
    .map(origin => normalizeOrigin(origin))
    .filter(Boolean)
    .concat(defaultAllowedOrigins)
    .map(origin => normalizeOrigin(origin));
const backendOrigins = [
    process.env.BACKEND_PUBLIC_URL,
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
]
    .filter(Boolean)
    .map(origin => normalizeOrigin(origin as string));

function isPayuOrigin(origin: string) {
    try {
        const hostname = new URL(origin).hostname.toLowerCase();
        return hostname === 'test.payu.in' || hostname === 'apitest.payu.in' || hostname.endsWith('.payu.in');
    } catch {
        return false;
    }
}

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        const normalizedOrigin = normalizeOrigin(origin);

        if (
            origin === 'null' ||
            allowedOrigins.includes(normalizedOrigin) ||
            backendOrigins.includes(normalizedOrigin) ||
            isPayuOrigin(normalizedOrigin)
        ) {
            callback(null, true);
            return;
        }

        console.warn(`Blocked CORS origin: ${origin}`);
        callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
};

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
if (!fs.existsSync(uploadRootDir)) {
    fs.mkdirSync(uploadRootDir, { recursive: true });
}
app.use('/uploads', express.static(uploadRootDir));

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
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/support', adminSupportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/support', supportRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Bouut Music API running at http://localhost:${PORT}`);
});

export default app;
