import { ChatChannel, ChannelList } from 'shared-interfaces/channel.interface';
import Channel from '../../models/channel.model';
import User from '../../models/user.model';
import { sendFriendsUserList } from '../friends/send-friends-list';

export function getDmChannels(io: any) {
  io.on('connection', socket => {
    socket.on('get-dm-channels', async (data: ChatChannel[]) => {
      const user: any = await User
        .findById(socket.claim.user_id)
        .lean();
      if (!user) {
        socket.emit('soft-error', 'You are not logged in.');
        return;
      }

      console.log('SENDING CHANNEL LIST');
      sendChannelList(user._id, socket);

      sendFriendsUserList(io, socket, user);
    });
  });
}

export async function sendChannelList(userId, socket) {
  let start = process.hrtime();
  const elapsed_time = function (note) {
    const precision = 3; // 3 decimal places
    const elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + ' s, ' + elapsed.toFixed(precision) + ' ms - ' + note); // print message + time
    start = process.hrtime(); // reset the timer
  };

  const channels: any = await Channel
    .find({
      user_ids: userId
    },
    {
      name: 1,
      user_ids: 1,
    })
    .lean();

  elapsed_time('GOTCHANNELS');

  // Get all users in channels for their usernames etc.
  const usersObject = channels.reduce((acc, chan) => {
    chan.user_ids.forEach(id => acc[id] = null);
    return acc;
  }, {});

  const usersArray = Object.keys(usersObject);
  elapsed_time('USERSARRAY');
  const users: any = await User.find(
    {
      _id: usersArray
    }, {
      username: 1
    })
    .lean();

  elapsed_time('GOTUSERS');

  users.forEach(user => {
    usersObject[user._id] = user;
  });
  elapsed_time('USR1');
  const list = <ChannelList>{
    server_id: 'friends',
    channels: channels,
    users: usersObject
  };
  console.log('EMITTING');
  socket.emit('channel-list', list);
}
