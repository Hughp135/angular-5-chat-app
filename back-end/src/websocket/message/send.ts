import ChatMessageModel from '../../models/chatmessage.model';
import Channel, { DM_CHANNEL } from '../../models/channel.model';
import { SendMessageRequest, ChatMessage } from 'shared-interfaces/message.interface';
import User from '../../models/user.model';
import Server from '../../models/server.model';
import * as config from 'config';
import canJoinServer from '../auth/can-join-server';
const TEST_SECRET = config.get('TEST_SOCKET_SECRET');

export function sendMessage(io: any) {
  io.on('connection', (socket) => {
    socket.on('send-message', async (request: SendMessageRequest) => {
      if (request.message.length < 1 || request.message.length > 5000) {
        socket.emit('soft-error', 'Invalid message length');
        return;
      }

      // TEST SOCKET ONLY
      if (socket.handshake.query && socket.handshake.query.test === TEST_SECRET) {
        const [testUser, firstChannel] = await getTestUserObjects(socket, request);
        await emitMessage(io, request.message, firstChannel, testUser);

        return;
      }

      const [user, channel]: Array<any> = await Promise.all([
        User.findById(socket.claim.user_id).lean(),
        Channel.findById(request.channel_id),
      ]);

      if (!channel) {
        return socket.emit('soft-error', 'This channel no longer exists.');
      }

      // FRIENDS SERVER (DM)
      if (channel.getChannelType() === DM_CHANNEL) {
        if (!channel.user_ids.toString().includes(user._id.toString())) {
          socket.emit('soft-error', 'You are not allowed to send this message.');
          return;
        }

        await emitMessage(io, request.message, channel, user);
        return;
      }

      // NORMAL SERVER
      const server: any = await Server.findById(channel.server_id).lean();
      if (!server || !await canJoinServer(user, channel.server_id)) {
        socket.emit('soft-error', 'You don\'t have permission to send this message.');
        return;
      }

      await emitMessage(io, request.message, channel, user, server);

      return;
    });
  });
}

async function emitMessage(io, message: string, channel, user, server?) {
  const now = new Date();
  const chatMessage: ChatMessage = {
    username: user.username,
    message: message,
    channel_id: channel._id,
    user_id: user._id,
    createdAt: now,
    updatedAt: now,
  };

  if (server) {
    io.in(`server-${server._id}`).emit('chat-message', chatMessage);
  } else {
    io.in(`dmchannel-${channel._id}`).emit('chat-message', chatMessage);
  }

  channel.last_message = now;
  await Promise.all([
    ChatMessageModel.create(chatMessage),
    channel.save(),
  ]);
}

async function getTestUserObjects(socket, request) {
  // TEST USERS ONLY
  const user: any = await User.findById(socket.claim.user_id).lean();
  if (request.channel_id) {
    const server: any = await Server.findById(request.server_id).lean();
    const channel: any = await Channel.findById(request.channel_id);
    return [user, channel, server];
  } else {
    const [server_id] = user.joined_servers;
    const server: any = await Server.findById(server_id).lean();
    const channel: any = await Channel.findOne({
      server_id: server_id,
    });
    return [user, channel, server];
  }
}
