import User from '../../models/user.model';

export default async function canJoinServer(user: any, server_id: string) {
  if (typeof user === 'string') {
    user = await User.findById(user).lean();
    if (!user) {
      return false;
    }
  }

  if (!user.joinedServers.includes(server_id.toString())) {
    return false;
  }

  return true;
}
