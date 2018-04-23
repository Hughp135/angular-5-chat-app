import voiceChannelModel from '../../models/voice-channel.model';

export function joinVoiceChannel(io: any) {

  io.on('connection', async socket => {

    socket.on('join-voice-channel', async channelId => {
      await handler(io, socket, channelId);
    });

  });
}

export async function handler(io, socket, channelId) {
  console.log('user joinin channel', socket.id, channelId);
  // Todo: checks here
  const channel = await voiceChannelModel.findOne({
    _id: channelId,
  }).lean();
  if (!channel) {
    return socket.emit('soft-error', 'This voice channel no longer exists');
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
  // io.of('/').in(`voicechannel-${channelId}`).emit('voice-channel-users', {
  //   channelId,
  //   users,
  // });
  socket.emit('joined-voice-channel', {
    channelId,
    users,
  });
}
