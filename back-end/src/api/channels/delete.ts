import Channel from '../../models/channel.model';
import serverModel from '../../models/server.model';
import { getChannelList } from '../../websocket/server/join';

export async function deleteChannel(req, res) {
  const channel: any = await Channel.findOne({
    _id: req.params.id,
  });

  const server: any = await serverModel.findOne({
    _id: channel.server_id,
  }, { owner_id: 1 }).lean();

  if (server.owner_id.toString() !== req.claim.user_id) {
    return res.status(401).json({
      error: 'You must be the server owner to delete a channel',
    });
  }

  await channel.remove();

  const channelList = await getChannelList(server._id);

  res.status(200).json({
    channelList,
  });
}
