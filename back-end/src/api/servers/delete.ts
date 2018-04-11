import Server from '../../models/server.model';
import { ObjectId } from 'bson';

export async function deleteServer(req, res) {
  const server = await Server.findById(req.params.id);

  if (server.owner_id.toString() !== req.claim.user_id) {
    return res.status(400).json({
      error: 'Only the owner can delete a server.',
    });
  }

  if (server.deleted) {
    return res.status(400).json({
      error: 'This server has already been deleted.',
    });
  }

  await server.delete();

  res.status(204).end();
}
