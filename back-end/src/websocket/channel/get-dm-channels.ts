import { ChannelList } from 'shared-interfaces/channel.interface';
import Channel, { channelsToChannelListItems } from '../../models/channel.model';
import User from '../../models/user.model';
import { sendFriendsUserList } from '../friends/send-friends-list';
import { leaveOtherServers } from '../server/join';

export function getDmChannels(io: any) {
  io.on('connection', socket => {
    socket.on('get-dm-channels', handler(io, socket));
  });
}

export function handler(io, socket) {
  return async () => {
    const user: any = await User
      .findById(socket.claim.user_id)
      .lean();
    if (!user) {
      socket.emit('soft-error', 'You are not logged in.');
      return;
    }
    await leaveOtherServers(socket);
    await Promise.all([
      sendChannelList(user._id, socket),
      sendFriendsUserList(io, socket, user),
    ]);
  };
}

export async function sendChannelList(userId, socket) {
  const channels: any = await Channel
    .find({
      user_ids: userId,
    },
      {
        _id: 1,
        name: 1,
        user_ids: 1,
        server_id: 1,
      })
    .sort({ _id: 1 })
    .lean();

  const channelsFormatted = channelsToChannelListItems(channels);

  // Get all users in channels for their usernames etc.
  const usersObject = channels.reduce((acc, chan) => {
    chan.user_ids.forEach(id => acc[id] = null);
    return acc;
  }, {});

  const usersArray = Object.keys(usersObject);
  const users: any = await User.find(
    {
      _id: usersArray,
    }, {
      username: 1,
    })
    .lean();

  users.forEach(user => {
    usersObject[user._id] = user;
  });

  const list: ChannelList = {
    server_id: 'friends',
    channels: channelsFormatted,
    users: usersObject,
  };
  socket.emit('channel-list', list);
}
