import User from '../../models/user.model';
import { log } from 'winston';
import { sendFriendsUserList } from './send-friends-list';

/* istanbul ignore next */
export function removeFriend(io: any) {
  io.on('connection', socket => {
    socket.on('remove-friend', async (userId: string) => {
      try {
        await handler(io, socket, userId);
      } catch (e) {
        log('error', 'remove-friend', e);
      }
    });
  });
}

export async function handler(io, socket, userId: string) {
  const user = await User.findById(socket.claim.user_id, { friends: 1 });
  if (!user) {
    return socket.error('Invalid token');
  }

  user.friends = user.friends.filter(id => id !== userId);
  await user.save();
  await sendFriendsUserList(io, socket, user);

  const toUser = await User.findById(userId, { friends: 1, socket_id: 1 });
  if (!toUser) {
    return;
  }

  toUser.friends = toUser.friends.filter(id => id !== user._id.toString());
  await toUser.save();

  const toUserSocket = io.of('/').connected[toUser.socket_id];
  if (toUserSocket) {
    await sendFriendsUserList(io, toUserSocket, toUser);
  }
}
