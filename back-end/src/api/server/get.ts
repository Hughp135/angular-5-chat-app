import Server from '../../models/server.model';
import User from '../../models/user.model';

export async function getServers(req, res) {
  const user = await User.findOne({ '_id': req.claim.user_id });
  if (!user) {
    return res.status(401).json({
      error: 'User not found.'
    });
  }

  const serverIds = user.joinedServers;
  const servers = await Server.find({
    '_id': serverIds
  }).lean();

  res.status(200).json({
    servers: servers
  });
}
