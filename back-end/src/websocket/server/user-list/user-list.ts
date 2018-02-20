import User from '../../../models/user.model';
import { ServerUserList, UserListUser } from 'shared-interfaces/server.interface';

export async function sendUserList(io: any, socket: any, server_id: string) {

  const connectedSockets = io.of('/').connected;

  const connectedUsers = Object.values(connectedSockets)
    .map((sock: any) => {
      return sock.claim.user_id.toString();
    });

  const allServerUsers: any = await User.find({
    joinedServers: server_id.toString()
  }, {
      _id: 1,
      username: 1,
    }).lean();

  const serverUsers = allServerUsers.map(usr => {
    return <UserListUser>{
      ...usr,
      online: connectedUsers.includes(usr._id.toString()),
    };
  });

  const serverUserList: ServerUserList = {
    server_id: server_id,
    users: serverUsers
  };

  socket.emit('server-user-list', serverUserList);
}
