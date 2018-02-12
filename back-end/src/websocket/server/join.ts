import Server, { IServerModel } from '../../models/server.model';
import ChannelModel from '../../models/channel.model';

export async function joinServer(io: any) {
  io.on('connection', async socket => {
    socket.on('join-server', async serverId => {
      console.log('joining server', serverId);
      const server: IServerModel = <IServerModel> await Server.findById(serverId).lean();
      if (!server) {
        return;
      }
      const channels = await ChannelModel.find({
        server_id: server._id
      }).lean();
      socket.emit('channel-list', {
        server_id: server._id,
        channels: channels,
      });
    });
  });
}
