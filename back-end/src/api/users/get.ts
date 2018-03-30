import User from '../../models/user.model';
import { Me } from 'shared-interfaces/user.interface';

export async function getUser(req, res) {
  if (req.params.username === 'me') {
    return await getMeUser(req, res);
  }

  const user = await getUserByName(req.params.username);

  if (!user) {
    return res.status(404).json({
      error: 'User not found.',
    });
  }

  res.status(200).json({
    user,
  });
}

async function getMeUser(req, res) {
  const user: any = await getUserById(req.claim.user_id);
  const meUser: Me = {
    _id: user._id,
    username: user.username,
  };

  res.status(200).json({
    user: meUser,
  });
}

async function getUserById(id: string) {
  return await User.findById(id, { username: 1 }).lean();
}

async function getUserByName(username: string) {
  return await User.findOne(
    { username_lowercase: username.toLowerCase() },
    { username: 1 },
  ).lean();
}
