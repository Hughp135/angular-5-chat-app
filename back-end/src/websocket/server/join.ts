import Server, { IServerModel } from '../../models/server.model';
import ChannelModel from '../../models/channel.model';
import { ChannelList } from 'shared-interfaces/channel.interface';
import canJoinServer from '../auth/can-join-server';
import User from '../../models/user.model';
import * as mongoose from 'mongoose';
import { sendUserList } from './user-list';

export function joinServer(io: any) {
  io.on('connection', async socket => {
    socket.on('join-server', async serverId => {
      if (!mongoose.Types.ObjectId.isValid(serverId)) {
        socket.emit('soft-error', 'Invalid server ID');
        return;
      }

      const user = await User.findById(socket.claim.user_id).lean();
      if (!user) {
        socket.emit('soft-error', 'Unable to join.');
        return;
      }
      const server: IServerModel = <IServerModel>await Server.findById(serverId).lean();
      if (!server) {
        socket.emit('soft-error', 'The server you a trying to join does not exist.');
        return;
      }
      if (!await canJoinServer(user, server._id)) {
        socket.emit('soft-error', 'You don\'t have permission to join this server.');
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
      socket.join(`server-${server._id}`);
      sendUserList(io, socket, server);
    });
  });
}
