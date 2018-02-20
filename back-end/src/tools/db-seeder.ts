import * as mongoose from 'mongoose';
import Server from '../models/server.model';
import Channel from '../models/channel.model';
import User from '../models/user.model';
import ChatMessage from '../models/chatmessage.model';

console.warn('Warning! Wiping database in 1 seconds... Terminate the process now to abort.');
setTimeout(seed, 1000);

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
  const promises = [...Array(100)]
    .map((x, index) => {
      // const serverIdsSlice = Math.random() > 0.5
        // ? serverIds.slice(0, 3) : serverIds.slice(2, 4);
      return User.create({
        username: `User ${index}`,
        password: 'asdasd',
        joinedServers: serverIds
      });
    });
  return await Promise.all(promises);
}

async function createServers(owner_id) {
  const promises = [...Array(5)]
    .map((x, index) => {
      return Server.create({
        name: `Server ${index + 1}`,
        owner_id: owner_id,
      });
    });
  return await Promise.all(promises);
}

async function createChannels(serverIds) {
  const promises = serverIds
    .map((server_id) =>
      [...Array(5)].map((x, idx) =>
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
