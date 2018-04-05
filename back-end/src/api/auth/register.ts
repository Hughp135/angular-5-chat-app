import * as Joi from 'joi';
import User from '../../models/user.model';
import * as winston from 'winston';
import { returnJWTTokenAsCookie } from './login';

const schema = Joi.object().keys({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  password_confirm: Joi.string().required().valid(Joi.ref('password')).options({
    language: {
      any: {
        allowOnly: 'Passwords do not match',
      },
    },
  }),
});

export default async function (req, res) {
  const result = Joi.validate(req.body, schema);
  if (result.error) {
    return res.status(400).json({ error: result.error.details[0].message });
  }
  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
    });
    returnJWTTokenAsCookie(user, res);
  } catch (e) {
    if (e.message === 'duplicate username') {
      return res.status(400).json({ error: 'Username is already taken.' });
    } else {
      winston.log('error', 'auth/register failed', e);
      return res.status(500).json({ error: 'Sorry, a server error occured. Please try again later' });
    }
  }
}
