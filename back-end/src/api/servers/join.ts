import Server from '../../models/server.model';
import User from '../../models/user.model';

// Joins a server by the server's invite_id
export async function joinServer(req, res) {
  const user: any = await User.findOne({ '_id': req.claim.user_id });

  const server: any = await Server.findOne({
    invite_id: req.params.id,
  }, {
      name: 1,
    }).lean();

  if (!server) {
    return res.status(404).end();
  }

  if (!user.joined_servers.includes(server._id.toString())) {
    user.joined_servers.push(server._id.toString());
    await user.save();
  }

  res.status(204).end();
}
