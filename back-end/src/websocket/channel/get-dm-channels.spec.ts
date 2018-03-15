import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import { getDmChannels, sendChannelList, handler } from './get-dm-channels';
import Channel from '../../models/channel.model';
import User from '../../models/user.model';
import createFakeSocketEvent from '../test_helpers/fake-socket';
import { sendFriendsUserList } from '../friends/send-friends-list';

const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

describe('websocket channel/get-dm-channels', () => {
  let user1, user2, user3;
  let channel1, channel2;
  const sandbox = sinon.createSandbox();

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  beforeEach(async () => {
    user1 = await User.create({ username: 'test-user1', password: '123456' });
    user2 = await User.create({ username: 'test-user2', password: '123456' });
    user3 = await User.create({
      username: 'test-user3',
      password: '123456',
      friends: [user1._id, user2._id]
    });
    channel1 = await Channel.create({
      name: 'chantest',
      user_ids: [user1._id, user2._id],
    });
    channel2 = await Channel.create({
      name: 'chantest2',
      user_ids: [user1._id, user3._id],
    });
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    await Channel.remove({});
    result.resetHistory();
    sandbox.restore();
  });
  it('emits error if user not found', (done) => {
    const { io, socket } = createFakeSocketEvent('get-dm-channels', undefined,
      { user_id: '123456781234567812345678' }, onComplete, result);
    getDmChannels(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'You are not logged in.');
      done();
    }
  });
  it('getDmChannels emits channel-list and server-user-list', async () => {
    const socket = {
      claim: { user_id: user1._id },
      emit: sandbox.spy()
    };
    const io = {
      of: () => ({
        connected: {
        },
      }),
    };

    socket.emit = sandbox.spy();
    await handler(io, socket)();
    expect(socket.emit).to.have.been
      .calledWith('server-user-list', {
        server_id: 'friends',
        users: []
      });
    expect(socket.emit).to.have.been
      .calledWith('channel-list', {
        channels: [
          {
            _id: channel1._id,
            name: 'chantest',
            user_ids: [user1._id, user2._id]
          },
          {
            _id: channel2._id,
            name: 'chantest2',
            user_ids: [user1._id, user3._id]
          },
        ],
        server_id: 'friends',
        users: {
          [user1._id]: { _id: user1._id, username: user1.username },
          [user2._id]: { _id: user2._id, username: user2.username },
          [user3._id]: { _id: user3._id, username: user3.username },
        },
      });
    await expect(socket.emit).to.have.been
      .calledTwice;
  });
  it('sendChannelList function sends channel list', async () => {
    const socket = {
      emit: sandbox.spy()
    };
    await sendChannelList(user1._id, socket);
    await expect(socket.emit).to.have.been
      .calledWith('channel-list',
        {
          channels: [
            {
              _id: channel1._id,
              name: 'chantest',
              user_ids: [user1._id, user2._id]
            },
            {
              _id: channel2._id,
              name: 'chantest2',
              user_ids: [user1._id, user3._id]
            },
          ],
          server_id: 'friends',
          users: {
            [user1._id]: { _id: user1._id, username: user1.username },
            [user2._id]: { _id: user2._id, username: user2.username },
            [user3._id]: { _id: user3._id, username: user3.username },
          },
        }
      );
  });
  it('sends friends list', async () => {
    const io = {
      of: () => ({
        connected: {
        },
      }),
    };
    const socket = {
      emit: sandbox.spy()
    };
    await sendFriendsUserList(io, socket, user3);
    expect(socket.emit).to.have.been
      .calledWith('server-user-list',
        {
          server_id: 'friends',
          users:
            [{
              _id: user1._id,
              username: 'test-user1',
              online: false
            },
            {
              _id: user2._id,
              username: 'test-user2',
              online: false
            }]
        }
      );
  });
});
