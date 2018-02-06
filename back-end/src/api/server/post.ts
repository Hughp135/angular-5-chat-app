import Server from '../../models/server.model';
import User from '../../models/user.model';
import * as mongoose from 'mongoose';
import * as Joi from 'joi';

const schema = Joi.object().keys({
  name: Joi.string().min(3).max(30).required(),
});

export async function createServer(req, res) {
  const userId = req.claim.user_id;

  const user = await User.findOne({ '_id': userId }).lean();
  if (!user) {
    return res.status(401).json({
      error: 'User not found.'
    });
  }

  const result = Joi.validate(req.body, schema);
  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }

  const existingServer = await Server.findOne({
    owner_id: userId
  }).lean();

  if (existingServer) {
    return res.status(400).json({
      error: 'You already own a server. Please delete or edit your existing server.'
    });
  }

  await Server.create({
    name: req.body.name,
    owner_id: new mongoose.Types.ObjectId(userId),
  });

  res.status(200).json({ success: true });
}
