import User from '../../models/user';
import * as bcrypt from 'bcrypt';
import * as Joi from 'joi';

const schema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export default async function (req, res) {
  const validation = Joi.validate(req.body, schema);
  if (validation.error) {
    res.status(400).json({
      error: validation.error.details[0].message,
    });
    return;
  }

  const user: any = await User.findOne({
    username: req.body.username
  }).lean();

  if (!user) {
    res.status(401).json({
      error: 'Username or password incorrect.',
    });
    return;
  }

  const result = await bcrypt.compare(req.body.password, user.password);
  if (!result) {
    res.status(401).json({
      error: 'Username or password incorrect.',
    });
    return;
  }
  res.status(204).end();
}
