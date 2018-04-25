import { CreateVoiceChannelRequest } from 'shared-interfaces/voice-channel.interface';
import serverModel from '../../models/server.model';
import { log } from 'winston';
import voiceChannelModel from '../../models/voice-channel.model';
import { getChannelList } from '../server/join';

/* istanbul ignore next */
export function createVoiceChannel(io: any) {

  io.on('connection', socket => {
    socket.on('create-channel', async (channelData: CreateVoiceChannelRequest) => {
      await handler(io, socket, channelData);
    });
  });
}

export async function handler(io, socket, channelData) {
  const server = await serverModel.findById(channelData.server_id);
  if (!server) {
    return socket.emit('soft-error', 'Server not found.');
  }

  if (server.owner_id.toString() !== socket.claim.user_id) {
    socket.emit('soft-error', 'You do not have permission to add a channel.');
    log('Error creating server:', `socket.claim.user_id ${socket.claim.user_id} does not match server.owner_id ${server.owner_id}`);
    return;
  }

  try {
    await voiceChannelModel.create({
      server_id: server._id,
      name: channelData.name,
    });

    const channelList = await getChannelList(server._id);

    io.in(`server-${server._id}`).emit('channel-list', channelList);
  } catch (err) {
    if (err.message && err.message.startsWith('Channel/server must be unique')) {
      socket.emit('soft-error', 'Channel name must be unique.');
    } else {
      throw (err);
    }
  }
}
