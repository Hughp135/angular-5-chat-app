import User from '../../models/user.model';
import { FriendRequest } from 'shared-interfaces/user.interface';
import { log } from 'winston';

/* istanbul ignore next */
export function getFriendRequests(io: any) {
  io.on('connection', socket => {
    socket.on('get-friend-requests', async () => {
      try {
        await handler(socket);
      } catch (e) {
        log('error', 'getFriendRequests', e);
      }
    });
  });
}

export async function handler(socket) {
  const user: any = await User.findById(socket.claim.user_id).lean();
  if (!user) {
    socket.error('Invalid token');
    throw new Error('User not found with id ' + socket.claim.user_id);
  }
  socket.emit('friend-requests', user.friend_requests);
}
