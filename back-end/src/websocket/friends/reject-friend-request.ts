import User from '../../models/user.model';
import { log } from 'winston';
import { addUsernamesToFriendRequests } from './get-friend-requests';
import { sendFriendRequestsToSocket } from './friend-request';

export function rejectFriendRequest(io: any) {
  io.on('connection', socket => {
    socket.on('reject-friend-request', async (userId: string) => {
      try {
        await handler(io, socket, userId);
      } catch (e) {
        log('error', 'sendFriendRequest', e);
      }
    });
  });
}

export async function handler(io, socket, userId) {
  const [fromUser, toUser] = await getUsers(socket, userId);

  if (fromUser.friend_requests.some(req => req.user_id.toString() === userId)) {
    fromUser.friend_requests = fromUser.friend_requests
      .filter(req => req.user_id.toString() !== userId.toString());
    await fromUser.save();
  }

  if (toUser && toUser.friend_requests.some(req => req.user_id.toString() === fromUser._id.toString())) {
    toUser.friend_requests = toUser.friend_requests
      .filter(req => req.user_id.toString() !== fromUser._id.toString());
    await toUser.save();
  }
  const requestsWithUsers = await addUsernamesToFriendRequests(fromUser.friend_requests);

  socket.emit('friend-requests', requestsWithUsers);
  await sendFriendRequestsToSocket(io, toUser);
}

async function getUsers(socket, userId: string) {
  const users: any = await User.find(
    {
      _id: [socket.claim.user_id, userId],
    },
    {
      username: 1,
      friend_requests: 1,
      friends: 1,
      socket_id: 1,
    });


  const fromUser = users.find(usr => usr._id.toString() === socket.claim.user_id);
  const toUser = users.find(usr => usr._id.toString() === userId);

  if (!fromUser) {
    socket.error('User not found');
    throw new Error('fromUser not found');
  }

  return [fromUser, toUser];
}
