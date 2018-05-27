import voiceChannelModel from '../../models/voice-channel.model';
import serverModel from '../../models/server.model';
import { getChannelList } from '../server/join';

/* istanbul ignore next */
export function deleteVoiceChannel(io: SocketIO.Server) {
  io.on('connection', socket => {
    socket.on('delete-voice-channel', async (channelId) => {
      await handler(channelId, io, socket);
    });
  });
}

export async function handler(channelId, io, socket) {
  const channel: any = await voiceChannelModel.findOne({
    _id: channelId,
  });

  if (!channel) {
    return socket.emit('soft-error', 'This channel has already been deleted');
  }

  const server: any = await serverModel.findOne({
    _id: channel.server_id,
  }).lean();

  if (server.owner_id.toString() !== socket.claim.user_id) {
    return socket.emit('soft-error', 'You must be the server owner to delete a channel');
  }

  await channel.remove();

  const channelList = await getChannelList(server._id);

  io.in(`server-${server._id}`).emit('channel-list', channelList);
}
