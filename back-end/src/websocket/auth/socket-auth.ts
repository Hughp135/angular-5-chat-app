import { verifyJWT } from '../../api/auth/jwt';
import * as cookie from 'cookie';
import { log } from 'winston';
import User from '../../models/user.model';
import * as config from 'config';
export { logInAuth };

const TEST_SECRET = config.get('TEST_SOCKET_SECRET');

function logInAuth(io?) {
  return async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.test === TEST_SECRET) {
      const allUsers: any = await User.find().lean();
      const index = Math.floor(Math.random() * allUsers.length);
      const user = allUsers[index];
      socket.claim = { username: user.username, user_id: user._id };
      return next();
    }
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
