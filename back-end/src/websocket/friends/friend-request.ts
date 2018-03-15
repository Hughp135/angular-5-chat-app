import User from '../../models/user.model';
import { FriendRequest } from 'shared-interfaces/user.interface';
import { log } from 'winston';
import { addUsernamesToFriendRequests } from './get-friend-requests';
import { sendFriendsUserList } from './send-friends-list';

export function sendFriendRequest(io: any) {
  io.on('connection', socket => {
    socket.on('send-friend-request', async (userId: string) => {
      try {
        await handler(io, socket, userId);
      } catch (e) {
        log('error', 'sendFriendRequest', e);
      }
    });
  });
}

export async function handler(io, socket, userId: string) {
  const [fromUser, toUser] = await getUsers(socket, userId);
  if (await checkIfAlreadyFriends(fromUser, toUser)) {
    return socket.emit('soft-error', 'You are already friends with this user.');
  }

  const promises = [];

  if (await acceptFriendRequest(fromUser, toUser)) {
    promises.push(
      sendFriendsUserList(io, socket, fromUser)
    );
    const toUserSocket = io.of('/').connected[toUser.socket_id];

    if (toUserSocket) {
      promises.push(
        sendFriendsUserList(io, toUserSocket, toUser)
      );
    }
  } else {
    await saveFriendRequests(fromUser, toUser);
  }

  socket.emit('sent-friend-request');
  promises.push(sendFriendRequestsToSocket(io, toUser));

  await Promise.all(promises);
}

export async function sendFriendRequestsToSocket(io, user) {
  const socket = io.of('/').connected[user.socket_id];
  if (socket) {
    // toUser is online, send friend requests
    const requestsWithUsers = await addUsernamesToFriendRequests(
      user.friend_requests,
    );

    socket.emit('friend-requests', requestsWithUsers);
  } else {
    // User not connected, remove socket id from user
    user.socket_id = null;
    await user.save();
  }
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
    },
  );

  const fromUser = users.find(
    usr => usr._id.toString() === socket.claim.user_id,
  );
  const toUser = users.find(usr => usr._id.toString() === userId);

  if (!fromUser) {
    socket.error('Invalid token');
    throw new Error('fromUser not found');
  }

  if (!toUser) {
    socket.emit('soft-error', 'User not found.');
    throw new Error(`User ${fromUser._id} not found`);
  }

  if (fromUser._id === toUser._id) {
    socket.emit('soft-error', 'You cannot friend yourself.');
    throw new Error(`fromUser and toUser are the same: ${fromUser._id}`);
  }

  return [fromUser, toUser];
}

async function checkIfAlreadyFriends(fromUser, toUser) {
  if (
    fromUser.friends &&
    fromUser.friends.some(id => id === toUser._id.toString())
  ) {
    return true;
  }
  return false;
}

async function acceptFriendRequest(fromUser, toUser) {
  // Checks if toUser has an outgoing friend request to fromUser
  if (
    toUser.friend_requests.some(
      req =>
        req.user_id.toString() === fromUser._id.toString() &&
        req.type === 'outgoing',
    )
  ) {
    // Add user to friends lists
    toUser.friends = [...toUser.friends, fromUser._id.toString()];
    fromUser.friends = [...fromUser.friends, toUser._id.toString()];

    // Remove friend request from users
    toUser.friend_requests = toUser.friend_requests.filter(
      req => req.user_id.toString() !== fromUser._id.toString(),
    );
    fromUser.friend_requests = fromUser.friend_requests.filter(
      req => req.user_id.toString() !== toUser._id.toString(),
    );

    await Promise.all([toUser.save(), fromUser.save()]);
    return true;
  }
  return false;
}

async function saveFriendRequests(fromUser, toUser) {
  const outgoingRequest: FriendRequest = {
    type: 'outgoing',
    user_id: toUser._id,
  };
  const incomingRequest: FriendRequest = {
    type: 'incoming',
    user_id: fromUser._id,
  };
  const promises = [];

  if (
    !fromUser.friend_requests.some(
      req => req.user_id.toString() === toUser._id.toString(),
    )
  ) {
    fromUser.friend_requests.push(outgoingRequest);
    promises.push(fromUser.save());
  }

  if (
    !toUser.friend_requests.some(
      req => req.user_id.toString() === fromUser._id.toString(),
    )
  ) {
    toUser.friend_requests.push(incomingRequest);
    promises.push(toUser.save());
  }

  await Promise.all(promises);
  return promises.length;
}
