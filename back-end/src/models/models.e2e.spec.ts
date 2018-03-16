import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';

import User from './user.model';
import Server from './server.model';
import Channel from './channel.model';
import ChatMessage from './chatmessage.model';

const expect = chai.expect;
chai.use(sinonChai);

describe('models e2e', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
    await User.remove({});
    await Server.remove({});
    await Channel.remove({});
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    await Server.remove({});
    await Channel.remove({});
  });

  it('create related channels, server, user, and message', async () => {
    const user: any = await User.create({
      username: 'test1',
      password: '123456',
    });
    const server = await Server.create({
      name: 'serverName',
      owner_id: user._id.toString(),
    });
    const channel = await Channel.create({
      name: 'channel1',
      server_id: server._id.toString(),
    });
    const date = new Date();
    date.setDate(1);
    const message = await ChatMessage.create({
      message: 'some message here',
      username: user.username,
      channel_id: channel._id,
      user_id: user._id,
      createdAt: date,
      updatedAt: date,
    });
    const savedServer = await Server.findById(server._id);
    const savedChannel = await Channel.findById(channel._id);
    const savedMessage = await ChatMessage.findById(message._id);
    expect(savedServer.owner_id.toString()).to.equal(user._id.toString());
    expect(savedChannel.server_id.toString()).to.equal(server._id.toString());
    expect(savedMessage.createdAt.toString()).to.equal(date.toString());
    expect(savedMessage.updatedAt.toString()).to.equal(date.toString());
  });
  it('will not allow 2 channels with same name in server', async () => {
    const channel = await Channel.create({
      name: 'channel1',
      server_id: '123456781234567812345678',
    });
    try {
      const channel2 = await Channel.create({
        name: 'channel1',
        server_id: '123456781234567812345678',
      });
      throw new Error('2nd Channel created when it shouldn\'t have');
    } catch (e) {
      expect(e.message).to.equal('Channel/server must be unique');
    }
  });
  it('create group channel with members', async () => {
    const user1: any = await User.create({
      username: 'test1',
      password: '123456',
    });
    const user2: any = await User.create({
      username: 'test2',
      password: '123456',
    });
    const channel: any = await Channel.create({
      name: 'testchan',
      user_ids: [user1._id, user2._id],
    });
    expect(channel.user_ids.length).to.equal(2);
  });
});
