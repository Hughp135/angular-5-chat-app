import User from '../../models/user.model';
import { ServerUserList, UserListUser } from 'shared-interfaces/server.interface';

export async function sendFriendsUserList(io: any, socket: any, user) {
  const connectedSockets = io.of('/').connected;

  const allFriends: any = await User.find({
    _id: user.friends,
  }, {
      _id: 1,
      username: 1,
      socket_id: 1,
    })
    .sort({ username: 1 })
    .lean();

  const usersWithStatuses = allFriends.map(usr => {
    return <UserListUser>{
      _id: usr._id,
      username: usr.username,
      online: !!connectedSockets[usr.socket_id],
    };
  });

  const serverUserList: ServerUserList = {
    server_id: 'friends',
    users: usersWithStatuses
  };
  socket.emit('server-user-list', serverUserList);
}
