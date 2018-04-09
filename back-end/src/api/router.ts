import { Router } from 'express';
import login from './auth/login';
import register from './auth/register';
import { authMiddleware } from './auth/router-middleware';
import { createServer } from './servers/post';
import { getServers } from './servers/get';
import { getChannels } from './channels/get';
import { getUser } from './users/get';
import { leaveServer } from './servers/leave';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Authenticated routes
router.post('/servers', authMiddleware, createServer);
router.get('/channels', authMiddleware, getChannels);
router.get('/servers', authMiddleware, getServers);
router.get('/users/:username', authMiddleware, getUser);
router.post('/leave-server/:id', authMiddleware, leaveServer);

export default router;
