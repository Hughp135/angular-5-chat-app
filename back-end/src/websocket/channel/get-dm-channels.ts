import { ChatChannel, ChannelList } from 'shared-interfaces/channel.interface';
import Channel from '../../models/channel.model';
import User from '../../models/user.model';
import { sendFriendsUserList } from '../friends/send-friends-list';

export function getDmChannels(io: any) {
  io.on('connection', socket => {
    socket.on('get-dm-channels', async (data: ChatChannel[]) => {
      const user: any = await User
        .findOne({ '_id': socket.claim.user_id })
        .lean();
      if (!user) {
        socket.emit('soft-error', 'You are not logged in.');
        return;
      }

      sendChannelList(user._id, socket);

      sendFriendsUserList(io, socket, user);
    });
  });
}

export async function sendChannelList(userId, socket) {
  const channels: any = await Channel
    .find({
      user_ids: userId
    },
    {
      name: 1,
      user_ids: 1,
    }).lean();

  // Get all users in channels for their usernames etc.
  const usersObject = channels.reduce((acc, chan) => {
    chan.user_ids.forEach(id => acc[id] = null);
    return acc;
  }, {});

  const usersArray = Object.keys(usersObject);

  const users: any = await User.find(
    {
      _id: usersArray
    }, {
      username: 1
    }).lean();

  users.forEach(user => {
    usersObject[user._id] = user;
  });

  const list = <ChannelList>{
    server_id: 'friends',
    channels: channels,
    users: usersObject
  };
  console.log(list);
  socket.emit('channel-list', list);
}
