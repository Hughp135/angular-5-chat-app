import { SocketCustom } from '../auth/socket-auth';
import { getSocketsInRoom } from './join';

/* istanbul ignore next */
export function leaveVoiceChannel(io: SocketIO.Server) {
  io.on('connection', async (socket: SocketCustom) => {
    socket.on('leave-voice-channel', async channelId => {
      await handler(io, socket, channelId);
    });
  });
}

export async function handler(
  io: SocketIO.Server,
  socket: SocketCustom,
  channelId: string,
) {
  socket.leave(`voicechannel-${channelId}`, async () => {
    await emitUsersToRoom(io, channelId);
  });
}

async function emitUsersToRoom(io, channelId) {
  const sockets = await getSocketsInRoom(io, `voicechannel-${channelId}`);
  const users = sockets.map(sock => {
    return {
      socket_id: sock.id,
      _id: sock.claim.user_id,
      username: sock.claim.username,
    };
  });

  // Emit user list to all sockets except requester
  io.in(`voicechannel-${channelId}`).emit('voice-channel-users', {
    channelId,
    users,
  });
}
