import Server from '../../../models/server.model';
import * as shortid from 'shortid';

// Creates an invite_id and adds to server if not exists
export async function createServerInvite(req, res) {
  const server = await Server.findOne({
    _id: req.body.server_id,
  }, {
    invite_id: 1,
  });

  if (!server) {
    return res.status(404).end();
  }

  if (!server.invite_id) {
    server.invite_id = shortid.generate();
    await server.save();
  }

  res.status(200).json({
    invite_id: server.invite_id,
  });
}
