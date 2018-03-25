import { verifyJWT } from './jwt';
import User from '../../models/user.model';

export async function authMiddleware(req, res, next) {
  try {
    const claim: any = await verifyJWT(req.cookies.jwt_token);
    const user = await User.findById(claim.user_id, { username: 1 }).lean();

    if (!user) {
      throw new Error('User not found with ID ' + claim.user_id);
    }
    req.claim = claim;

    return next();
  } catch (e) {
    res.status(401).json({
      error: 'You must be logged in.',
    });
  }
}
