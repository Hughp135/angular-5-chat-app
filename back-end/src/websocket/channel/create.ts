import Server from '../../models/server.model';
import Channel from '../../models/channel.model';
import { CreateChannelRequest } from 'shared-interfaces/channel.interface';
import { log } from 'winston';
import { getChannelList } from '../server/join';

/* istanbul ignore next */
export function createChannel(io: any) {
  io.on('connection', socket => {
    socket.on('create-channel', async (channelData: CreateChannelRequest) => {
      try {
        await handler(io, socket, channelData);
      } catch (e) {
        log('Error creating server:', e.message);
        socket.emit('soft-error', 'Failed to create channel.');
      }
    });
  });
}

export async function handler(io, socket, channelData) {
  const server = await Server.findById(channelData.server_id);
  if (!server) {
    return socket.emit('soft-error', 'Server not found.');
  }

  if (server.owner_id.toString() !== socket.claim.user_id) {
    socket.emit('soft-error', 'You do not have permission to add a channel.');
    log('Error creating server:', `socket.claim.user_id ${socket.claim.user_id} does not match server.owner_id ${server.owner_id}`);
    return;
  }

  try {
    await Channel.create({
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
