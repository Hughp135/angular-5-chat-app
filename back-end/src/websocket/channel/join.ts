import ChannelModel, { SERVER_CHANNEL, DM_CHANNEL } from '../../models/channel.model';
import User from '../../models/user.model';
import ChatMessageModel from '../../models/chatmessage.model';
import * as mongoose from 'mongoose';
import { JoinedChannelResponse } from 'shared-interfaces/channel.interface';
import { ChatMessage } from 'shared-interfaces/message.interface';
import canJoinServer from '../auth/can-join-server';

export async function joinChannel(io: any) {
  io.on('connection', async socket => {
    socket.on('join-channel', async channelId => {
      if (!mongoose.Types.ObjectId.isValid(channelId)) {
        socket.emit('soft-error', 'Invalid channel ID');
        return;
      }

      const [user, channel]: any = await Promise.all([
        User.findById(socket.claim.user_id).lean(),
        ChannelModel.findById(channelId),
      ]);

      if (!user || !channel) {
        socket.emit('soft-error', 'Unable to join this channel.');
        return;
      }

      const messages: ChatMessage[] = <ChatMessage[]>await ChatMessageModel
        .find({ channel_id: channelId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // NORMAL SERVER CHANNEL
      if (channel.getChannelType() === SERVER_CHANNEL) {
        if ( !await canJoinServer(user, channel.server_id)) {
          return socket.emit('soft-error', 'You don\'t have permission to join this server.');
        }
        await leaveOtherChannels(socket);
        socket.join(`channel-${channel._id}`);
      }

      // FRIENDS DM CHANNEL
      if (channel.getChannelType() === DM_CHANNEL) {
        if (!channel.user_ids.toString().includes(user._id.toString())) {
          socket.emit('soft-error', 'You don\'t have permission to join this channel.');
          return;
        }

        await leaveOtherChannels(socket);
        socket.join(`dmchannel-${channel._id}`);
      }

      // Send response with message history
      const response: JoinedChannelResponse = {
        channel_id: channel._id,
        messages,
      };

      socket.emit('joined-channel', response);
    });
  });
}

async function leaveOtherChannels(socket) {
  const roomsUserIsIn = Object.keys(socket.rooms);

  for (const room of roomsUserIsIn) {
    if (room.startsWith('channel-') || room.startsWith('dmchannel-')) {
      // Leave any other servers user is in.
      await socket.leave(room);
    }
  }
}
