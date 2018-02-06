import { Router } from 'express';
import login from './auth/login';
import register from './auth/register';
import authMiddleware from './auth/router-middleware';
import { createServer } from './server/post';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Authenticated routes
router.post('/server', authMiddleware, createServer);
router.get('/test', authMiddleware);

export default router;
