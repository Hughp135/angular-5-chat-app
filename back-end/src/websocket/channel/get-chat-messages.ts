import ChatMessageModel from '../../models/chatmessage.model';
import { ChatMessage } from 'shared-interfaces/message.interface';

/* istanbul ignore next */
export function getChatMessages(io: any) {
  io.on('connection', async socket => {
    socket.on('get-chat-messages', data => {
      handler(data, socket);
    });
  });
}

export async function handler(data, socket) {
  const messages: ChatMessage[] = <ChatMessage[]>await ChatMessageModel
    .find({
      channel_id: data.channel_id,
      createdAt: { $lt: data.before },
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  socket.emit('got-chat-messages', messages);
}
