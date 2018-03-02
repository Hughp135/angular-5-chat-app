import User from '../../models/user.model';
import Channel from '../../models/channel.model';

export function joinDmChannel(io: any) {
  io.on('connection', socket => {

    socket.on('join-or-create-dm-channel', async (userId) => {
      if (userId === socket.claim.user_id) {
        return socket.emit('soft-error', 'You cannot PM yourself.');
      }

      const user = User.findById(socket.claim.user_id).lean();
      if (!user) {
        return socket.emit('soft-error', 'You are not logged in.');
      }

      const toUser = User.findById(userId).lean();
      if (!toUser) {
        return socket.emit('soft-error', 'User not found.');
      }

      const [existingChannel]: any = await Channel.find({
        user_ids: {
          $all: [socket.claim.user_id, userId]
        }
      }).lean();

      const channel = existingChannel
        || await createNewChannel([socket.claim.user_id, userId]); // or create existing

      socket.emit('got-dm-channel', channel._id);
    });
  });
}

async function createNewChannel(userIds: Array<string>) {
  return await Channel.create({
    name: 'Direct Message',
    user_ids: userIds,
  });
}
