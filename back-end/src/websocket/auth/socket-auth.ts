import { verifyJWT } from '../../api/auth/jwt';
import * as cookie from 'cookie';

export { logInAuth };

function logInAuth(io?) {
  return async (socket, next) => {
    const cookieString = socket.handshake.headers.cookie;
    const cookies = cookie.parse(cookieString || '');
    if (!cookies.jwt_token) {
      return next(new Error('No token provided'));
    }
    try {
      await verifyJWT(cookies.jwt_token);
      return next();
    } catch (e) {
      return next(new Error('Invalid token'));
    }
  };
}
