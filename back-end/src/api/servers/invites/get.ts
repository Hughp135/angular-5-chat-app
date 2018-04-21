import Server from '../../../models/server.model';

export async function getServerInvite(req, res) {
  const server = await Server.findOne({
    invite_id: req.params.id,
  }, {
    name: 1,
  }).lean();

  if (!server) {
    return res.status(500).end();
  }
  res.status(200).json(server);
}
