import User from '../../models/user.model';
import Channel from '../../models/channel.model';

export function joinDmChannel(io: any) {
  io.on('connection', socket => {

    socket.on('join-dm-channel', (userId) => {
      const existingChannel = Channel.find({
        user_ids: {
          $all: [socket.claim.user_id, userId]
        }
      }).lean();
      const channel = existingChannel; // or create existing

    });
  });
}
