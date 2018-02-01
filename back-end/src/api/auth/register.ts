import * as Joi from 'joi';
import User from '../../models/user.model';
import * as winston from 'winston';

const schema = Joi.object().keys({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

export default async function (req, res) {
  const result = Joi.validate(req.body, schema);
  if (result.error) {
    return res.status(400).json({
      error: result.error.details[0].message,
    });
  }
  try {
    await User.create({
      username: req.body.username,
      password: req.body.password,
    });
  } catch (e) {
    if (e.message === 'duplicate username') {
      return res.status(400).json({
        error: 'Username is already taken.',
      });
    } else {
      winston.log('error', 'Creating user failed', e);
      return res.status(500).json({
        error: 'Sorry, a server error occured. Please try again later',
      });
    }
  }

  res.status(204).end();
}
