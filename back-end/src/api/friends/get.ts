import User from '../../models/user.model';
import Channel from '../../models/channel.model';

export async function getFriends(req, res) {
  const user: any = await User.findOne({ '_id': req.claim.user_id });
  if (!user) {
    return res.status(401).json({
      error: 'User not found.'
    });
  }

  const [friends, channels] = await Promise.all([

    User.find({
      '_id': user.friends
    }, {
        username: 1,
      }).lean(),

    Channel.find({
      user_ids: user._id
    }, {
      name: 1,
      user_ids: 1,
    }).lean(),

  ]);


  res.status(200).json({
    friends,
    channels,
  });
}
