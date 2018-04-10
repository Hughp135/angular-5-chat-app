import Server from '../../models/server.model';
import User from '../../models/user.model';

export async function leaveServer(req, res) {
  const server: any = await Server.findById(req.params.id);

  if (server.owner_id.toString() === req.claim.user_id) {
    return res.status(400).json({
      error: 'You cannot leave your own server.',
    });
  }

  user.joined_servers = user.joined_servers
    .filter(id => id !== req.params.id);

  await user.save();

  res.status(204).end();
}
