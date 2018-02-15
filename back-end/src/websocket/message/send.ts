import ChatMessageModel from '../../models/chatmessage.model';
import Channel from '../../models/channel.model';
import { SendMessageRequest, ChatMessage } from 'shared-interfaces/message.interface';


export function sendMessage(io: any) {
  io.on('connection', (socket) => {
    socket.on('send-message', async (request: SendMessageRequest) => {
      const now = new Date();
      const message: ChatMessage = {
        username: socket.claim.username,
        message: request.message,
        channel_id: request.channel_id,
        user_id: socket.claim.user_id,
        createdAt: now,
        updatedAt: now,
      };
      io.in(request.channel_id).emit('chat-message', message);
      saveMessage(message, socket);
    });
  });
}

async function saveMessage(message, socket) {
  const channel = await Channel.findById(message.channel_id);
  if (!channel) {
    throw new Error('channel not found');
  }
  await ChatMessageModel.create();
}
