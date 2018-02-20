import Server from '../../models/server.model';
import User from '../../models/user.model';
import * as Joi from 'joi';
import { log } from 'winston';

const schema = Joi.object().keys({
  name: Joi.string().min(3).max(30).required(),
});

export async function createServer(req, res) {
  const user = await User.findOne({ '_id': req.claim.user_id });
  if (!user) {
    return res.status(401).json({
      error: 'User not found.'
    });
  }

  const result = Joi.validate(req.body, schema);
  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }

  const existingServers: any = await Server.find({
    owner_id: user._id,
  }).lean();

  if (existingServers.length > 3) {
    return res.status(400).json({
      error: 'You already own 3 servers. Please delete an existing server to create a new one.'
    });
  }

  try {
    const server = await Server.create({
      name: req.body.name,
      owner_id: user._id,
    });

    (user as any).joinedServers.push(server._id);
    await user.save();

    res.status(200).json({ success: true });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({
        error: 'You already own a server with the same name. Please edit or delete your existing server first.'
      });
    } else {
      log('error', e);
      return res.status(500).json({
        error: 'A server error occured.'
      });
    }
  }
}
