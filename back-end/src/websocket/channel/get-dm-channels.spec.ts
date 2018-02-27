import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import { getDmChannels } from './get-dm-channels';
import Channel from '../../models/channel.model';
import User from '../../models/user.model';
import createFakeSocketEvent from '../test_helpers/fake-socket';

const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

describe('websocket channel/get-dm-channels', () => {
  let user1, user2, user3;
  let channel1, channel2;

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
    mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    await Channel.remove({});
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
  it('sends channel list', (done) => {
    const { io, socket } = createFakeSocketEvent('get-dm-channels', undefined,
      { user_id: user1._id.toString() }, onComplete, result);
    getDmChannels(io);
    function onComplete() {
      expect(result).to.have.been
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
          }
        );
      done();
    }
  });
  it('sends friends list', (done) => {
    const { io, socket } = createFakeSocketEvent('get-dm-channels', undefined,
      { user_id: user3._id.toString() }, onComplete, result);
    getDmChannels(io);
    function onComplete() {
      expect(result).to.have.been
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
      done();
    }
  });
});
