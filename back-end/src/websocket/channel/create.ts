import Server from '../../models/server.model';
import Channel from '../../models/channel.model';
import { Channel as IChannel } from 'shared-interfaces/channel.interface';
import { log } from 'winston';

export function createChannel(io: any) {
  io.on('connection', socket => {
    socket.on('create-channel', async (data: IChannel) => {
      try {
        const server = await Server.findById(data.server_id);
        await Channel.create({
          server_id: server._id,
          name: data.name
        });
        const channels = await Channel.find({
          server_id: server._id
        }).lean();
        socket.emit('channel-list', {
          server_id: server._id,
          channels: channels,
        });
      } catch (e) {
        log('Error creating server', e.message);
        socket.emit('soft-error', 'Failed to create channel.');
      }
    });
  });
}
