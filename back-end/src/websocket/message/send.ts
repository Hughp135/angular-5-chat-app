import ChatMessageModel from '../../models/chatmessage.model';
import Channel from '../../models/channel.model';
import { SendMessageRequest, ChatMessage } from 'shared-interfaces/message.interface';
import User from '../../models/user.model';
import Server from '../../models/server.model';


export function sendMessage(io: any) {
  io.on('connection', (socket) => {
    socket.on('send-message', async (request: SendMessageRequest) => {
      const [user, channel, server]: any = await Promise.all([
        User.findById(socket.claim.user_id).lean(),
        Channel.findById(request.channel_id).lean(),
        Server.findById(request.server_id).lean(),
      ]);
      if (!user || !channel || !server || !user.joinedServers.includes(server._id.toString()) ) {
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
      await saveMessage(message, socket);
    });
  });
}

async function saveMessage(message, socket) {
  await Channel.findById(message.channel_id);
  await ChatMessageModel.create(message);
}
