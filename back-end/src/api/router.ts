import { Router } from 'express';
import login from './auth/login';
import register from './auth/register';
import authMiddleware from './auth/router-middleware';
import { createServer } from './server/post';
import { getServers } from './server/get';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Authenticated routes
router.post('/server', authMiddleware, createServer);
router.get('/server', authMiddleware, getServers);

export default router;
