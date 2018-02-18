import ChannelModel from '../../models/channel.model';
import User from '../../models/user.model';
import Server from '../../models/server.model';
import ChatMessage from '../../models/chatmessage.model';
import * as mongoose from 'mongoose';

export async function joinChannel(io: any) {
  io.on('connection', async socket => {
    socket.on('join-channel', async channelId => {
      if (!mongoose.Types.ObjectId.isValid(channelId)) {
        socket.emit('soft-error', 'Invalid channel ID');
        return;
      }

      const [user, channel]: any = await Promise.all([
        User.findById(socket.claim.user_id).lean(),
        ChannelModel.findById(channelId).lean(),
      ]);

      if (!user || !channel) {
        socket.emit('soft-error', 'Unable to join this channel.');
        return;
      }
      const messages = await ChatMessage.find({ channel_id: channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      const server: any = await Server.findById(channel.server_id).lean();

      if (!server || !user.joinedServers.includes(server._id.toString())) {
        socket.emit('soft-error', 'You don\'t have permission to join this channel.');
        return;
      }

      socket.join(channelId);
      socket.emit('joined-channel', {
        messages
      });
    });
  });
}
