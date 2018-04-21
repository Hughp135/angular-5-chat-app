import Server from '../../../models/server.model';

// Checks if a server with a given invite_id exists and returns the server name
export async function getServerInvite(req, res) {
  const server = await Server.findOne({
    invite_id: req.params.id,
  }, {
    name: 1,
  }).lean();

  if (!server) {
    return res.status(404).end();
  }

  res.status(200).json(server);
}
