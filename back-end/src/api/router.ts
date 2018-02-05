import { Router } from 'express';
import login from './auth/login';
import register from './auth/register';
import { verifyJWT } from './auth/jwt';

const router = Router();

const authMiddleware = async (req, res, next) => {
  try {
    req.claim = await verifyJWT(req.cookies.jwt_token);
    console.log('claim', req.claim);
    next();
  } catch (e) {
    res.status(401).json({
      error: 'You must be logged in.',
    });
  }
};

router.post('/login', login);
router.post('/register', register);
router.get('/test', authMiddleware);

export default router;
