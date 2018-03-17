import User from '../../models/user.model';

export async function getUser(req, res) {
  const user: any = await User.findOne(
    { $text: { $search: req.params.username } },
    { username: 1 },
  );
  if (!user) {
    return res.status(404).json({
      error: 'User not found.',
    });
  }

  setTimeout(() => {
    res.status(200).json({
      user,
    });

  }, 1000);
}
