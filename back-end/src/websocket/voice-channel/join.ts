import voiceChannelModel from '../../models/voice-channel.model';
import canJoinServer from '../auth/can-join-server';
import userModel from '../../models/user.model';

/* istanbul ignore next */
export function joinVoiceChannel(io: any) {
  io.on('connection', async socket => {
    socket.on('join-voice-channel', async channelId => {
      await handler(io, socket, channelId);
    });
  });
}

export async function handler(io, socket, channelId) {
  const user = await userModel
    .findOne({
      _id: socket.claim.user_id,
    }, {
      joined_servers: 1,
    }).lean();
  const channel: any = await voiceChannelModel.findOne({
    _id: channelId,
  }).lean();
  if (!channel) {
    return socket.emit('soft-error', 'This voice channel no longer exists');
  }

  if (!await canJoinServer(user, channel.server_id)) {
    return socket.emit('soft-error', 'You don\'t have permission to join this server.');
  }

  socket.join(`voicechannel-${channelId}`);

  const sockets = Object.values(io.of('/').in(`voicechannel-${channelId}`).connected);
  const users = sockets.map(sock => ({
    socket_id: sock.id,
    _id: sock.claim.user_id,
    username: sock.claim.username,
  }));
  sockets.filter(sock => sock.id !== socket.id).forEach(sock => {
    sock.emit('voice-channel-users', {
      channelId,
      users,
    });
  });
  socket.emit('joined-voice-channel', {
    channelId,
    users,
  });
}
