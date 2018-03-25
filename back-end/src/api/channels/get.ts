import Channel from '../../models/channel.model';

// NOTE: Websocket route is currently used instead of this.

export async function getChannels(req, res) {
  const channels = await Channel.find({
    user_ids: req.claim.user_id,
  }, {
      name: 1,
      user_ids: 1,
    }).lean();

  res.status(200).json({
    channels,
  });
}
