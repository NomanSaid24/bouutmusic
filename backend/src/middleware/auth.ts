import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
    user?: { id: string; role: string; email: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = { id: payload.id, role: payload.role, email: payload.email };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

export const requirePro = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.isPro) {
        return res.status(403).json({ error: 'Pro subscription required', code: 'PRO_REQUIRED' });
    }
    next();
};
