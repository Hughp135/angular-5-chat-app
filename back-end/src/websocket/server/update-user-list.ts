import User from '../../models/user.model';
import { log } from 'winston';
import { UserListUser } from 'shared-interfaces/server.interface';

// Called when user changes status e.g. on login
export async function updateUserList(user_id, io) {
  try {
    const user: any = await User.findById(user_id).lean();
    user.joinedServers.forEach(serverId => {
      const usrListUsr: UserListUser = {
        username: user.username,
        user_id: user._id,
        online: true,
      };
      io.in(`server-${serverId}`).emit('update-user-list', usrListUsr);
    });
  } catch (e) {
    /* istanbul ignore next */
    log('error', e);
  }
}
