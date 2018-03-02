import User from '../../models/user.model';
import { ServerUserList, UserListUser } from 'shared-interfaces/server.interface';

export async function sendFriendsUserList(io: any, socket: any, user) {
  let start = process.hrtime();
  const elapsed_time = function (note) {
    const precision = 3; // 3 decimal places
    const elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + ' s, ' + elapsed.toFixed(precision) + ' ms - ' + note); // print message + time
    start = process.hrtime(); // reset the timer
  };

  const connectedSockets = io.of('/').connected;

  const connectedUsers = Object.values(connectedSockets)
    .map((sock: any) => {
      return sock.claim.user_id.toString();
    }).reduce((acc, cur) => {
      acc[cur] = true;
      return acc;
    }, {});

  const allFriends: any = await User.find({
    _id: user.friends,
  }, {
      _id: 1,
      username: 1,
    }).lean();
    elapsed_time('2 GOTFRIENDS');

  const usersWithStatuses = allFriends.map(usr => {
    return <UserListUser>{
      ...usr,
      online: !!connectedUsers[usr._id.toString()],
    };
  });

  const serverUserList: ServerUserList = {
    server_id: 'friends',
    users: usersWithStatuses
  };
  socket.emit('server-user-list', serverUserList);
}
