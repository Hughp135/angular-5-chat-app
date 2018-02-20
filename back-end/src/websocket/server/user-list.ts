import User from '../../models/user.model';
import { ServerUserList } from 'shared-interfaces/server.interface';

export async function sendUserList(io: any, socket: any, server: any) {
  const connectedSockets = io.of('/').connected;
  const connectedUsers = Object.values(connectedSockets)
    .map((sock: any) => {
      return sock.claim.user_id.toString();
    });

  const allServerUsers: any = await User.find({
    joinedServers: server._id.toString()
  }, {
      _id: 1,
      username: 1,
    }).lean();
  const serverUsers = allServerUsers.map(usr => {
    return {
      ...usr,
      online: connectedUsers.includes(usr._id.toString()),
    };
  });

  const serverUserList: ServerUserList = {
    server_id: server._id,
    users: serverUsers
  };

  socket.emit('server-user-list', serverUserList);
}
