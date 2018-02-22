import Server, { IServerModel } from '../../models/server.model';
import ChannelModel from '../../models/channel.model';
import { ChannelList } from 'shared-interfaces/channel.interface';
import canJoinServer from '../auth/can-join-server';
import User from '../../models/user.model';
import * as mongoose from 'mongoose';
import { sendUserList } from './user-list/user-list';

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

      // Leave / Join appropriate socket rooms
      leaveOtherServers(socket);
      socket.join(`server-${server._id}`);

      // Send state
      sendUserList(io, socket, server._id);
      sendChannelList(socket, server._id);
    });
  });
}

async function sendChannelList(socket, serverId) {
  const channels: any = await ChannelModel.find({
    server_id: serverId
  }).lean();

  const list = <ChannelList>{
    server_id: serverId,
    channels: channels,
  };
  socket.emit('channel-list', list);
}

export async function leaveOtherServers(socket) {
  const roomsUserIsIn = Object.keys(socket.rooms);
  for (const room of roomsUserIsIn) {
    if (room.startsWith('server-') && room !== socket.id) {
      // Leave any other servers user is in.
      await socket.leave(room);
    }
  }
}
