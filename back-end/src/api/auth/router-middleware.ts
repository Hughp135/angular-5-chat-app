import { verifyJWT } from './jwt';

async function authMiddleware(req, res, next) {
  try {
    req.claim = await verifyJWT(req.cookies.jwt_token);
    return next();
  } catch (e) {
    res.status(401).json({
      error: 'You must be logged in.',
    });
  }
}

export default authMiddleware;
