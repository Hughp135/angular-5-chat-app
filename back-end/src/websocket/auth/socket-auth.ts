import { verifyJWT } from '../../api/auth/jwt';
import * as cookie from 'cookie';
import { log } from 'winston';

export { logInAuth };

function logInAuth(io?) {
  return async (socket, next) => {
    const cookieString = socket.handshake.headers.cookie;
    const cookies = cookie.parse(cookieString || '');
    if (!cookies.jwt_token) {
      log('info', 'No token provided');
      return next(new Error('No token provided'));
    }
    try {
      socket.claim = await verifyJWT(cookies.jwt_token);
      return next();
    } catch (e) {
      log('info', 'Invalid token');
      return next(new Error('Invalid token'));
    }
  };
}
