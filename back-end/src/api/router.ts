import { Router } from 'express';
import login from './auth/login';
import register from './auth/register';

const router = Router();

router.post('/login', login);
router.post('/register', register);

export default router;
