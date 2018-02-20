import ChatMessageModel from '../../models/chatmessage.model';
import Channel from '../../models/channel.model';
import { SendMessageRequest, ChatMessage } from 'shared-interfaces/message.interface';
import User from '../../models/user.model';
import Server from '../../models/server.model';
import * as config from 'config';
const TEST_SECRET = config.get('TEST_SOCKET_SECRET');

export function sendMessage(io: any) {
  io.on('connection', (socket) => {
    socket.on('send-message', async (request: SendMessageRequest) => {
      const [user, channel, server] = await getUserChannelServer(socket, request);


      if (!user || !channel || !server || !user.joinedServers.includes(server._id.toString())) {
        socket.emit('soft-error', 'You don\'t have permission to send this message.');
        return;
      }
      const now = new Date();
      const message: ChatMessage = {
        username: socket.claim.username,
        message: request.message,
        channel_id: channel._id,
        user_id: user._id,
        createdAt: now,
        updatedAt: now,
      };
      io.in(`server-${server._id}`).emit('chat-message', message);
      await saveMessage(message);
    });
  });
}

async function saveMessage(message) {
  await ChatMessageModel.create(message);
}

async function getUserChannelServer(socket, request) {
  if (socket.handshake.query && socket.handshake.query.test === TEST_SECRET) {
    const user: any = await User.findById(socket.claim.user_id).lean();
    const [server_id] = user.joinedServers;
    const server: any = await Server.findById(server_id).lean();
    const [channel]: any = await Channel.find({
      server_id: server_id
    }).lean();
    return [user, channel, server];
  } else {
    return await Promise.all([
      User.findById(socket.claim.user_id).lean(),
      Channel.findById(request.channel_id).lean(),
      Server.findById(request.server_id).lean(),
    ]);

  }
}

async function handler(request: SendMessageRequest) {

}
