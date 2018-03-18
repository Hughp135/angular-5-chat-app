import Server from '../../models/server.model';
import Channel, { channelsToChannelListItems } from '../../models/channel.model';
import { CreateChannelRequest, ChannelList } from 'shared-interfaces/channel.interface';
import { log } from 'winston';

export function createChannel(io: any) {
  io.on('connection', socket => {
    socket.on('create-channel', async (channelData: CreateChannelRequest) => {
      try {
        await handler(socket, channelData);
      } catch (e) {
        log('Error creating server:', e.message);
        socket.emit('soft-error', 'Failed to create channel.');
      }
    });
  });
}

export async function handler(socket, channelData) {
  const server = await Server.findById(channelData.server_id);

  if (server.owner_id.toString() !== socket.claim.user_id) {
    throw new Error('Attempting to create a channel on a server you do not own');
  }
  await Channel.create({
    server_id: server._id,
    name: channelData.name,
  });
  const channels: any = await Channel.find({
    server_id: server._id,
  }, {
      _id: 1,
      name: 1,
      server_id: 1,
      last_message: 1,
    }).lean();

  const channelsFormatted = channelsToChannelListItems(channels);

  const channelList: ChannelList = {
    server_id: server._id,
    channels: channelsFormatted,
  };

  socket.emit('channel-list', channelList);
}
