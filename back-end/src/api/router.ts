import { Router } from 'express';
import login from './auth/login';
import register from './auth/register';
import authMiddleware from './auth/router-middleware';
import { createServer } from './servers/post';
import { getServers } from './servers/get';
import { getFriends } from './friends/get';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Authenticated routes
router.post('/servers', authMiddleware, createServer);
router.get('/friends', authMiddleware, getFriends);
router.get('/servers', authMiddleware, getServers);

export default router;
