import Server from '../../models/server.model';

export async function deleteServer(req, res) {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return res.status(400).json({
      error: 'This server does not exist.',
    });
  }

  if (server.owner_id.toString() !== req.claim.user_id) {
    return res.status(400).json({
      error: 'Only the owner can delete a server.',
    });
  }

  await server.delete();

  res.status(204).end();
}
