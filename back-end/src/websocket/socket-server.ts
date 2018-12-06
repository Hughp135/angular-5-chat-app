import * as socketIo from 'socket.io';
import { logInAuth, SocketCustom } from './auth/socket-auth';
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
import { deleteChannel } from './channel/delete';
import { leaveVoiceChannel } from './voice-channel/leave';
import { createVoiceChannel } from './voice-channel/create';
import { deleteVoiceChannel } from './voice-channel/delete';
import { getVoiceUsers } from './server/get-voice-channel-users';

let ioServer = null;

export function getIoServer() {
  return ioServer;
}

export async function startWs(server) {
  const io = socketIo(server);
  io.use(logInAuth(io));
  io.on('connection', async (socket: SocketCustom) => {
    log(
      'info',
      `User connected: ${socket.id}, ${socket.claim.username} ${socket.claim.user_id}`,
    );
  });
  (<any>io).setMaxListeners(50);
  // Add event handlers

  // Server
  joinServer(io);
  getUserList(io);
  getDmChannels(io);
  joinDmChannel(io);
  getVoiceUsers(io);

  // Text Channels
  createChannel(io);
  deleteChannel(io);
  joinChannel(io);
  sendMessage(io);
  getChatMessages(io);

  // Voice Channels
  joinVoiceChannel(io);
  leaveVoiceChannel(io);
  createVoiceChannel(io);
  deleteVoiceChannel(io);

  // Friends
  sendFriendRequest(io);
  getFriendRequests(io);
  rejectFriendRequest(io);
  removeFriend(io);

  // WebRTC
  signal(io);

  ioServer = io;
}

setInterval(() => {}, 50); // Socket IO fix hack
