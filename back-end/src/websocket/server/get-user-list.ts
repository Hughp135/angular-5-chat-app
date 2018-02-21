import User from '../../models/user.model';
import canJoinServer from '../auth/can-join-server';
import { sendUserList } from './user-list/user-list';

export function getUserList(io: any) {

  io.on('connection', async socket => {
    socket.on('get-user-list', async serverId => {
      const user = await User.findById(socket.claim.user_id).lean();
      if (!user) {
        return;
      }
      if (await canJoinServer(user, serverId)) {
        sendUserList(io, socket, serverId);
      }
    });
  });

}
