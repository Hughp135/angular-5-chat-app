import Server from '../../models/server.model';
import User from '../../models/user.model';

export async function getServers(req, res) {
  const user: any = await User.findOne({ '_id': req.claim.user_id });
  const serverIds = user.joined_servers;
  const servers = await Server.find({
    _id: serverIds,
  }).lean();

  res.status(200).json({
    servers: servers,
  });
}
