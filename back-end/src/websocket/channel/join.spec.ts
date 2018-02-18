import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import { createChannel } from './create';
import { joinChannel } from './join';
import Channel from '../../models/channel.model';
import Server from '../../models/server.model';
import User from '../../models/user.model';
import createFakeSocketEvent from '../test_helpers/fake-socket';

const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

describe('websocket channel/join', () => {
  let serverId;
  let user;
  let channel;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    const server = await Server.create({
      name: 'test-server',
      owner_id: '123456781234567812345678',
    });
    serverId = server._id;
    user = await User.create({
      username: 'test-user3',
      password: '123123',
    });
    channel = await Channel.create({
      name: 'test-chan1',
      server_id: server._id
    });
  });
  afterEach(async () => {
    await Server.remove({});
    await Channel.remove({});
    await User.remove({});
    result.resetHistory();
  });
  it('does not join channel if channel id invalid', (done) => {
    const { io, socket } = createFakeSocketEvent('join-channel', '123',
      { user_id: user._id.toString() }, onComplete, result);
    joinChannel(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'Invalid channel ID');
      done();
    }
  });
  it('does not join channel if channel does not exist', (done) => {
    const { io, socket } = createFakeSocketEvent('join-channel', '123456781234567812345678',
      { user_id: user._id.toString() }, onComplete, result);
    joinChannel(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'Unable to join this channel.');
      done();
    }
  });
  it('does not join channel if user has not joined the server', (done) => {
    const { io, socket } = createFakeSocketEvent('join-channel', channel._id.toString(),
      { user_id: user._id.toString() }, onComplete, result);
    joinChannel(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'You don\'t have permission to join this channel.');
      done();
    }
  });
  it('joins the channel', (done) => {
    user.joinedServers = [serverId.toString()];
    user.save().then(() => {
      const { io, socket } = createFakeSocketEvent('join-channel', channel._id.toString(),
        { user_id: user._id.toString() }, onComplete, result);
      joinChannel(io);
      function onComplete() {
        expect(result).to.have.been
          .calledWith('joined-channel', { messages: [] });
        done();
      }
    });
  });
});
