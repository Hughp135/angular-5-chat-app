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
  const userIds = friend_requests.map(req => req.user_id);
  const users: any = await User.find({
    _id: userIds
  }, {
      username: 1,
    }).lean();

  return JSON.parse(JSON.stringify(friend_requests)).map(req => {
    const matchingUser = users
      .find(usr => usr._id.toString() === req.user_id.toString());

    if (!matchingUser) {
      return log('error', 'No matching user found with ID', req.user_id);
    }
    const withUsername = {
      ...req,
      username: matchingUser && matchingUser.username
    };

    return withUsername;
  });
}
