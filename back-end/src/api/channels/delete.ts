import Channel from '../../models/channel.model';
import serverModel from '../../models/server.model';
import { getChannelList } from '../../websocket/server/join';

// Note: websocket endpoint currently used instead of this
export async function deleteChannel(req, res) {
  const channel: any = await Channel.findOne({
    _id: req.params.id,
  });

  if (!channel) {
    return res.status(400).json({
      error: 'This channel has already been deleted',
    });
  }

  const server: any = await serverModel.findOne({
    _id: channel.server_id,
  }).lean();

  if (server.owner_id.toString() !== req.claim.user_id) {
    return res.status(401).json({
      error: 'You must be the server owner to delete a channel',
    });
  }

  await channel.remove();

  const channelList = await getChannelList(server._id);

  res.status(200).json(channelList);
}
