import User from '../../models/user.model';
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

  const requestsWithUsers = await addUsernamesToFriendRequests(user.friend_requests);

  socket.emit('friend-requests', requestsWithUsers);
}

export async function addUsernamesToFriendRequests(friend_requests) {
  const friendIds = friend_requests.map(req => req.user_id);
  const friends: any = await User.find({
    _id: friendIds,
  }, {
      username: 1,
    }).lean();

  return friend_requests
    // Filter out requests with no existing user
    .filter(req => friends.some(friend => friend._id.toString() === req.user_id.toString()))
    // Add username to each request
    .map(req => {
      const matchingUser = friends
        .find(usr => usr._id.toString() === req.user_id.toString());

      const withUsername = {
        type: req.type,
        user_id: req.user_id.toString(),
        _id: req._id.toString(),
        username: matchingUser && matchingUser.username,
      };

      return withUsername;
    });
}
