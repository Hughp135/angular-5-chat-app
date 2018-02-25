import { ChatChannel, ChannelList } from 'shared-interfaces/channel.interface';
import Channel from '../../models/channel.model';
import User from '../../models/user.model';
import { sendFriendsUserList } from '../friends/get-friends-list';

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

      const channels = await Channel
        .find({
          user_ids: user._id
        },
        {
          name: 1,
          user_ids: 1,
        }).lean();

      const list = <ChannelList>{
        server_id: 'friends',
        channels: channels,
      };

      sendFriendsUserList(io, socket, user);

      socket.emit('channel-list', list);
    });
  });
}
