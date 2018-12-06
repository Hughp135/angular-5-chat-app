import canJoinServer from '../auth/can-join-server';
import VoiceChannel from '../../models/voice-channel.model';
import User from '../../models/user.model';
import Server from '../../models/server.model';
import { sendUserList } from './user-list/user-list';

export function getVoiceUsers(io: any) {
  io.on('connection', async socket => {
    socket.on('get-server-voice-channel-users', async serverId => {
      const user = await User.findById(socket.claim.user_id).lean();
      if (!user) {
        return;
      }
      if (!(await canJoinServer(user, serverId))) {
        return socket.emit(
          'soft-error',
          'You don\'t have permission to join this server.',
        );
      }

      const voiceChannels = await VoiceChannel.find(
        { server_id: serverId },
        { _id: 1 },
      ).lean();

      const voiceChannelsLookup = voiceChannels.reduce((all, curr) => {
        all[`voicechannel-${curr._id}`] = true;

        return all;
      }, {});

      const voiceChannelsSockets = Object.entries(io.of('/').adapter.rooms)
        .filter(([key]) => voiceChannelsLookup[key])
        .reduce(
          (acc, [key, value]) => {
            const sockets = Object.keys(value.sockets);
            acc[key] = sockets;
            acc._all.push(...sockets);
            return acc;
          },
          { _all: [] },
        ); // return format: { [key]: roomName, value: socketId[], _all: sockets[] }

      const users = await User.find(
        { socket_id: voiceChannelsSockets._all },
        { _id: 1, username: 1, socket_id: 1 },
      ).lean();

      const voiceChannelsUsers = voiceChannels.reduce((all, voiceChannel) => {
        const channelSockets = voiceChannelsSockets[`voicechannel-${voiceChannel._id}`];
        const channelUsers = users.filter(usr => channelSockets.includes(usr.socket_id));
        all[voiceChannel._id] = channelUsers.map(usr => ({
          _id: usr._id,
          username: usr.username,
        }));

        return all;
      }, {});

      socket.emit('server-voice-users', voiceChannelsUsers);
    });
  });
}
