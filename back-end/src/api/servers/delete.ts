import Server from '../../models/server.model';
import User from '../../models/user.model';

export async function deleteServer(req, res) {
  const user: any = await User.findById(req.claim.user_id);
  const server: any = await Server.findById(req.params.id);

  if (server.owner_id.toString() !== req.claim.user_id) {
    return res.status(400).json({
      error: 'Only the owner can delete a server.',
    });
  }

  res.status(400).json({
    error: 'Method not implemented yet',
  });
}
