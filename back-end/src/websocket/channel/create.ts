import Server from '../../models/server.model';
import Channel from '../../models/channel.model';

export async function createChannel(io: any) {
  io.on('connection', async socket => {
    socket.on('create-channel', async data => {
      console.log('create-channel', data);
      const server = await Server.findById(data.server_id);
      if (!server) {
        console.log('sever not found');
        return;
      }
      await Channel.create({
        server_id: server._id,
        name: data.channel_name
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
