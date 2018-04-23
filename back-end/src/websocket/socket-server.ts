import * as socketIo from 'socket.io';
import { logInAuth } from './auth/socket-auth';
import { log } from 'winston';
import { joinServer } from './server/join';
import { createChannel } from './channel/create';
import { joinChannel } from './channel/join';
import { sendMessage } from './message/send';
import { getUserList } from './server/get-user-list';
import { getDmChannels } from './channel/get-dm-channels';
import { joinDmChannel } from './channel/join-or-create-dm';
import { sendFriendRequest } from './friends/friend-request';
import { getFriendRequests } from './friends/get-friend-requests';
import { rejectFriendRequest } from './friends/reject-friend-request';
import { removeFriend } from './friends/remove-friend';
import { getChatMessages } from './channel/get-chat-messages';
import { signal } from './webrtc/signal';
import { joinVoiceChannel } from './voice-channel/join';

export async function startWs(server) {
  const io = socketIo(server);
  io.use(logInAuth(io));
  io.on('connection', async socket => {
    log('info', `User connected: ${socket.id}, ${socket.claim.username} ${socket.claim.user_id}`);
  });
  io.setMaxListeners(50);
  // Add event handlers
  joinServer(io);
  createChannel(io);
  joinChannel(io);
  joinVoiceChannel(io);
  sendMessage(io);
  getUserList(io);
  getDmChannels(io);
  joinDmChannel(io);
  getChatMessages(io);
  sendFriendRequest(io);
  getFriendRequests(io);
  rejectFriendRequest(io);
  removeFriend(io);
  signal(io);
  return io;
}

setInterval(() => {
}, 50); // Socket IO fix hack
