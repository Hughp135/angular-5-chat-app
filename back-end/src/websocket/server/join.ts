import Server, { IServerModel } from '../../models/server.model';
import ChannelModel, { IChannelModel } from '../../models/channel.model';
import { ChannelList, ChatChannel } from 'shared-interfaces/channel.interface';

export function joinServer(io: any) {
  io.on('connection', async socket => {
    socket.on('join-server', async serverId => {
      const server: IServerModel = <IServerModel>await Server.findById(serverId).lean();
      if (!server) {
        return;
      }
      const channels: any = await ChannelModel.find({
        server_id: server._id
      }).lean();
      const channelList: ChannelList = {
        server_id: server._id,
        channels: channels,
      };
      socket.emit('channel-list', channelList);
    });
  });
}
