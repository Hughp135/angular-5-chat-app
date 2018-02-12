import Server from '../../models/server.model';
import Channel from '../../models/channel.model';
import { Channel as IChannel } from 'shared-interfaces/channel.interface';

export function createChannel(io: any) {
  io.on('connection', socket => {
    socket.on('create-channel', async (data: IChannel) => {
      const server = await Server.findById(data.server_id);
      if (!server) {
        return;
      }
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
    });
  });
}
