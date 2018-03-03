import Server from '../../models/server.model';
import User from '../../models/user.model';
import * as Joi from 'joi';
import { log } from 'winston';
import * as fs from 'fs';

const schema = Joi.object().keys({
  name: Joi.string().min(3).max(30).required(),
  icon: Joi.string().base64().min(8).max(20000).allow(null),
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
    log('error', result.error.details[0].message);
    const errorMessage = getValidationMessage(result.error.details);
    return res.status(400).json({ error: errorMessage });
  }

  if (await existingServerCount(user) >= 3) {
    return res.status(400).json({
      error: 'You can only own a maximum of 3 servers. Please delete or edit an existing server before creating a new one'
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

    saveServerIcon(server, req.body.icon);

  } catch (e) {
    /* istanbul ignore else */
    if (e.code === 11000) {
      return res.status(400).json({
        error: 'You already own a server with the same name. Please choose another name or edit your existing server.'
      });
    } else {
      log('error', e);
      return res.status(500).json({
        error: 'A server error occured.'
      });
    }
  }
}

async function saveServerIcon(server, icon) {
  fs.writeFile(`back-end/dist/public/img/test.png`, icon, 'base64', (e) => {
    if (e) {
      return log('error', 'Error Writing File:', e);
    }
    server.image_url = 'back-end/dist/public/img/test.png';
    await server.save();
  });
}

function getValidationMessage(details) {
  for (const error of details) {
    switch (error.context.key) {
      case 'name':
        return 'Invalid server name. Must be at least 3 characters and max 30 characters long.';
      case 'icon':
        return 'Uploaded Image is too large or in an invalid format.';
      default:
        return 'Invalid data submitted, please try again later.';
    }
  }
}

async function existingServerCount(user) {
  const servers: any = await Server.find({
    owner_id: user._id,
  }).lean();
  return servers.length;
}
