import User from '../../models/user.model';
import { ServerUserList, UserListUser } from 'shared-interfaces/server.interface';

export async function sendFriendsUserList(io: any, socket: any, user) {

  const connectedSockets = io.of('/').connected;

  const connectedUsers = Object.values(connectedSockets)
    .map((sock: any) => {
      return sock.claim.user_id.toString();
    });

  const allFriends: any = await User.find({
    _id: user.friends,
  }, {
      _id: 1,
      username: 1,
    }).lean();

  const usersWithStatuses = allFriends.map(usr => {
    return <UserListUser>{
      ...usr,
      online: connectedUsers.includes(usr._id.toString()),
    };
  });

  const serverUserList: ServerUserList = {
    server_id: 'friends',
    users: usersWithStatuses
  };

  socket.emit('server-user-list', serverUserList);
}
