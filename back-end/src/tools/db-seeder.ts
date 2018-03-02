import * as mongoose from 'mongoose';
import Server from '../models/server.model';
import Channel from '../models/channel.model';
import User from '../models/user.model';
import ChatMessage from '../models/chatmessage.model';
import * as bcrypt from 'bcrypt';

console.warn('Warning! Wiping database in 5 seconds... Terminate the process now to abort.');
setTimeout(seed, 5000);

async function seed() {
  console.warn('Connecting to MongoDB...');
  await mongoose.connect('mongodb://localhost/myapp');
  console.warn('Removing all collections...');
  await removeAllCollections();
  console.warn('Generating users...');
  const user: any = await createMainUser();

  console.warn('Generating servers...');
  const servers = await createServers(user._id);
  const serverIds = servers.map(srv => srv._id.toString());

  // Set user.joinedServers and save
  user.joinedServers = serverIds;
  await user.save();

  console.warn('Creating channels...');
  await createChannels(serverIds);

  console.warn('Creating extra users...');
  await createUsersInServers(serverIds);

  console.warn('Adding friends to main user');
  await addFriendsToUser(user);

  console.warn('Creating DM channels');
  await createDMChannels(user);

  console.warn('Finished!');
  await mongoose.disconnect();
  process.exit();
}

async function createMainUser() {
  return await User.create({
    username: 'asd',
    password: 'asdasd',
  });
}

async function createUsersInServers(serverIds) {
  const pass = await bcrypt.hash('asdasd', 1);
  const users = [...Array(1000)]
    .map((x, index) => {
      // const serverIdsSlice = Math.random() > 0.5
      // ? serverIds.slice(0, 3) : serverIds.slice(2, 4);
      return new User({
        username: `User ${index}`,
        password: pass,
        joinedServers: serverIds
      });
    });
  return await User.insertMany(users);
}

async function createServers(owner_id) {
  const servers = [...Array(5)]
    .map((x, index) => {
      return new Server({
        name: `Server ${index + 1}`,
        owner_id: owner_id,
        image_url: index % 2 === 0 ? 'https://semantic-ui.com/images/avatar/small/elliot.jpg' : undefined,
      });
    });
  return await Server.insertMany(servers);
}

async function createChannels(serverIds) {
  const promises = serverIds
    .map((server_id) =>
      [...Array(3)].map((x, idx) =>
        Channel.create({
          name: `Text Channel ${idx + 1}`,
          server_id: server_id,
        })
      )
    ).reduce((a, b) => a.concat(b));

  return await Promise.all(promises);
}

async function removeAllCollections() {
  await Server.remove({});
  await User.remove({});
  await Channel.remove({});
  await ChatMessage.remove({});
}

async function addFriendsToUser(user) {
  const otherUsers: any = await User
    .find({ '_id': { $ne: user._id } })
    .limit(500)
    .lean();
  otherUsers.forEach(otherUser => {
    user.friends.push(otherUser._id.toString());
  });
  await user.save();
}

async function createDMChannels(user) {
  const otherUsers: any = await User
    .find({ '_id': { $ne: user._id } })
    .sort({ '_id': -1 })
    .limit(300)
    .lean();
  const promises = [];
  otherUsers.forEach(async usr => {
    promises.push(Channel.create({
      name: 'DMChannel @ ' + usr.username,
      user_ids: [user._id, usr._id]
    }));
  });
  await Promise.all(promises);
}
