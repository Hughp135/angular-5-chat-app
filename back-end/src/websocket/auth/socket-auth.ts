import { verifyJWT } from '../../api/auth/jwt';
import * as cookie from 'cookie';
import { log } from 'winston';
import User from '../../models/user.model';
import * as config from 'config';
import { updateUserList } from '../server/user-list/update-user-list';
export { logInAuth };

const TEST_SECRET = config.get('TEST_SOCKET_SECRET');

function logInAuth(io) {
  return async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.test === TEST_SECRET) {
      const allUsers: any = await User.find().lean();
      const index = Math.floor(Math.random() * allUsers.length);
      const user = allUsers[index];

      socket.claim = { username: user.username, user_id: user._id };
      updateUserList(user, io);
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
      const user: any = await User.findById(socket.claim.user_id);

      if (!user) {
        return next(new Error('User not found'));
      }
      user.socket_id = socket.id;
      await user.save();
      updateUserList(user, io);
      return next();
    } catch (e) {
      log('info', 'Socket Auth', e);
      return next(new Error('Invalid token'));
    }
  };
}
