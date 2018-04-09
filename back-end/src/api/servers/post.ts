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
  const result = Joi.validate(req.body, schema);

  if (result.error) {
    log('error', result.error.details[0].message);
    const errorMessage = getValidationMessage(result.error.details);
    return res.status(400).json({ error: errorMessage });
  }

  if (await existingServerCount(user) >= 3) {
    return res.status(400).json({
      error: 'You can only own a maximum of 3 servers. Please delete or edit an existing server before creating a new one',
    });
  }



  try {
    const server = await Server.create({
      name: req.body.name,
      owner_id: user._id,
    });

    (user as any).joined_servers.push(server._id);
    await user.save();

    if (req.body.icon) {
      await saveServerIcon(server, req.body.icon);
    }

    res.status(200).json({
      server,
    });
  } catch (e) {
    /* istanbul ignore else */
    if (e.code === 11000) {
      return res.status(400).json({
        error: 'You already own a server with the same name. Please choose another name or edit your existing server.',
      });
    } else {
      return res.status(500).json({
        error: 'A server error occured.',
      });
    }
  }
}

async function saveServerIcon(server, icon) {
  return await new Promise(resolve => {
    const imgUrl = `img/server-icons/${server._id}.jpg`;
    fs.writeFile(
      `back-end/dist/public/${imgUrl}`,
      icon,
      'base64',
      async (e) => {
        if (e) {
          log('error', 'Error Writing Server Image File:', server, e);
          return resolve(false);
        }
        server.image_url = `img/server-icons/${server._id}.jpg`;
        await server.save();
        resolve(true);
      },
    );
  });
}

function getValidationMessage(details) {
  for (const error of details) {
    switch (error.context.key) {
      case 'name':
        return 'Invalid server name. Must be at least 3 characters and max 30 characters long.';
      case 'icon':
        return 'Uploaded Image is too large or in an invalid format.';
      /* istanbul ignore next */
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
