import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import Channel from '../../models/channel.model';
import Server from '../../models/server.model';
import User from '../../models/user.model';
import createFakeSocketEvent from '../test_helpers/fake-socket';
import { joinServer, leaveOtherServers } from './join';
import voiceChannelModel from '../../models/voice-channel.model';

const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

describe('websocket server/join', () => {
  let server;
  let user;
  let channel;
  let voiceChannel;
  const sandbox = sinon.createSandbox();
  const nowDate = new Date();

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    server = await Server.create({
      name: 'test-server',
      owner_id: '123456781234567812345678',
    });
    user = await User.create({
      username: 'test-user3',
      password: '123123',
    });
    channel = await Channel.create({
      name: 'test-chan1',
      server_id: server._id,
      last_message: nowDate,
    });
    voiceChannel = await voiceChannelModel.create({
      name: 'test-chan1',
      server_id: server._id,
    });
  });
  afterEach(async () => {
    await Server.remove({});
    await Channel.remove({});
    await User.remove({});
    result.resetHistory();
    sandbox.restore();
  });

  it('does not join server if server id invalid', (done) => {
    const { io, socket } = createFakeSocketEvent('join-server', '123',
      { user_id: user._id }, onComplete, result);
    joinServer(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'Invalid server ID');
      done();
    }
  });
  it('does not join server if user does not exist', (done) => {
    const { io, socket } = createFakeSocketEvent('join-server', server._id,
      { user_id: '123456781234567812345678' }, onComplete, result);
    joinServer(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'Unable to join.');
      done();
    }
  });
  it('does not join server if server does not exist', (done) => {
    const { io, socket } = createFakeSocketEvent('join-server', '123456781234567812345678',
      { user_id: user._id }, onComplete, result);
    joinServer(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'The server you a trying to join does not exist.');
      done();
    }
  });
  it('does not join server if user has not joined the server', (done) => {
    const { io, socket } = createFakeSocketEvent('join-server', server._id,
      { user_id: user._id }, onComplete, result);
    joinServer(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'You don\'t have permission to join this server.');
      done();
    }
  });
  it('joins the server', (done) => {
    user.joined_servers = [server._id.toString()];
    user.save().then(() => {
      const { io, socket } = createFakeSocketEvent('join-channel', server._id,
        { user_id: user._id }, onComplete, result);
      sandbox.spy(socket, 'join');
      sandbox.spy(socket, 'leave');
      joinServer(io);
      function onComplete() {
        expect(result).to.have.been
          .calledWith('channel-list', {
            server_id: server._id,
            channels: [{
              name: channel.name,
              server_id: server._id.toString(),
              _id: channel._id.toString(),
              last_message: nowDate,
            }],
            voiceChannels: [{
              name: voiceChannel.name,
              _id: voiceChannel._id,
            }],
          });
        expect(socket.join).to.have.been
          .calledWith(`server-${server._id}`);
        expect(socket.leave).to.have.been
          .calledWith('server-123');
        done();
      }
    });
  });
  it('leaves other servers', () => {
    const socket = {
      id: '123',
      rooms: { '123': true, 'server-asd': true },
      leave: sandbox.spy(),
    };
    leaveOtherServers(socket);
    expect(socket.leave).to.have.been
      .calledWith('server-asd');
  });
  it('leaves other dm-channels', () => {
    const socket = {
      id: '123',
      rooms: { '123': true, 'dmchannel-asd': true },
      leave: sandbox.spy(),
    };
    leaveOtherServers(socket);
    expect(socket.leave).to.have.been
      .calledWith('dmchannel-asd');
  });
});
