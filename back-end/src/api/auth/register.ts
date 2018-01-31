import * as Joi from 'joi';
import User from '../../models/user';

const schema = Joi.object().keys({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

export default async function (req, res) {
  const result = Joi.validate(req.body, schema);
  if (result.error) {
    res.status(400).json({
      error: result.error.details[0].message,
    });
    return;
  }
  try {
    await User.create({
      username: req.body.username,
      password: req.body.password,
    });
  } catch (e) {
    if (e.code === 11000 || e.message === 'duplicate username') {
      res.status(400).json({
        error: 'Username is already taken.',
      });
      return;
    }
  }

  res.status(204).end();
}
