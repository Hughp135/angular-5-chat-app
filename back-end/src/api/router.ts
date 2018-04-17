import { Router } from 'express';
import login from './auth/login';
import register from './auth/register';
import { authMiddleware } from './auth/router-middleware';
import { createServer } from './servers/post';
import { getServers } from './servers/get';
import { getChannels } from './channels/get';
import { getUser } from './users/get';
import { leaveServer } from './servers/leave';
import { deleteServer } from './servers/delete';
import { deleteChannel } from './channels/delete';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Authenticated routes
router.post('/servers', authMiddleware, createServer);
router.get('/channels', authMiddleware, getChannels);
router.get('/servers', authMiddleware, getServers);
router.get('/users/:username', authMiddleware, getUser);
// Servers
router.post('/leave-server/:id', authMiddleware, leaveServer);
router.delete('/delete-server/:id', authMiddleware, deleteServer);
// Channels
router.delete('/delete-channel/:id', authMiddleware, deleteChannel);

export default router;
