import voiceChannelModel from '../../models/voice-channel.model';
import canJoinServer from '../auth/can-join-server';
import userModel from '../../models/user.model';
import { SocketCustom } from '../auth/socket-auth';

/* istanbul ignore next */
export function joinVoiceChannel(io: SocketIO.Server) {
  io.on('connection', async (socket: SocketCustom) => {
    socket.on('join-voice-channel', async channelId => {
      await handler(io, socket, channelId);
    });
  });
}

export async function handler(
  io: SocketIO.Server,
  socket: SocketCustom,
  channelId: string,
) {
  const user = await userModel
    .findOne(
      {
        _id: socket.claim.user_id,
      },
      {
        joined_servers: 1,
      },
    )
    .lean();
  const channel: any = await voiceChannelModel
    .findOne({
      _id: channelId,
    })
    .lean();

  if (!channel) {
    return socket.emit('soft-error', 'This voice channel no longer exists');
  }

  if (!(await canJoinServer(user, channel.server_id))) {
    return socket.emit('soft-error', 'You don\'t have permission to join this server.');
  }

  socket.join(`voicechannel-${channelId}`);

  const sockets = await getSocketsInRoom(io, `voicechannel-${channelId}`);
  const users = sockets.map(sock => {
    return {
      socket_id: sock.id,
      _id: sock.claim.user_id,
      username: sock.claim.username,
    };
  });

  // Emit user list to all sockets except requester
  sockets
    .filter(sock => sock.id !== socket.id)
    .forEach(sock => {
      sock.emit('voice-channel-users', {
        channelId,
        users,
      });
    });

  // Emit joined-voice-channel to requester
  socket.emit('joined-voice-channel', {
    channelId,
    users,
  });
}

export function getSocketsInRoom(
  io: SocketIO.Server,
  room: string,
): Promise<SocketCustom[]> {
  return new Promise((resolve, reject) => {
    io.of('/')
      .in(room)
      .clients((error, clients) => {
        /* istanbul ignore next */
        if (error) {
          reject(error);
        }
        const connected = io.of('/').connected;
        const sockets = clients
          .map(client => connected[client])
          .filter(socket => !!socket);
        resolve(sockets);
      });
  });
}
