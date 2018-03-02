import User from '../../models/user.model';
import Channel from '../../models/channel.model';

// NOTE: Websocket route is currently used instead of this.

export async function getChannels(req, res) {
  const user: any = await User.findOne({ '_id': req.claim.user_id });
  if (!user) {
    return res.status(401).json({
      error: 'User not found.'
    });
  }

  const channels = await Channel.find({
    user_ids: user._id
  }, {
      name: 1,
      user_ids: 1,
    }).lean();

  res.status(200).json({
    channels
  });
}
