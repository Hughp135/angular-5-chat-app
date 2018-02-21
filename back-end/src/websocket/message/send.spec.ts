import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import { sendMessage } from './send';
import Channel from '../../models/channel.model';
import ChatMessage from '../../models/chatmessage.model';
import createFakeSocketEvent from '../test_helpers/fake-socket';
import { SendMessageRequest } from '../../../../shared-interfaces/message.interface';
import serverModel from '../../models/server.model';
import userModel from '../../models/user.model';
import * as config from 'config';

const TEST_SECRET = config.get('TEST_SOCKET_SECRET');
const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

describe('websocket message/send', () => {
  let channelId;
  let sandbox;
  let server;
  let user;
  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    user = await userModel.create({
      username: 'myUsername',
      password: 'fkknows',
    });
    server = await serverModel.create({
      name: 'test-server',
      owner_id: user._id,
    });
    await userModel.findByIdAndUpdate(user._id, {
      $set: {
        joinedServers: [server._id]
      }
    });
    const channel = await Channel.create({
      name: 'test-channel',
      server_id: server._id,
    });

    channelId = channel._id;
  });
  afterEach(async () => {
    sandbox.restore();
    await Channel.remove({});
    await serverModel.remove({});
    await userModel.remove({});
    await ChatMessage.remove({});
    result.resetHistory();
  });
  it('sends a message', (done) => {
    const messageRequest: SendMessageRequest = {
      message: 'hi thar',
      channel_id: channelId.toString(),
      server_id: server._id.toString(),
    };
    const { io, socket } = createFakeSocketEvent('send-message', messageRequest,
      { user_id: user._id, username: user.username },
      onComplete, result);
    sandbox.spy(Channel, 'findById');
    sandbox.spy(ChatMessage, 'create');
    sandbox.spy(userModel, 'findById');
    sandbox.spy(serverModel, 'findById');
    async function onComplete() {
      expect(result).to.have.been
        .calledWith('chat-message',
          sinon.match({
            channel_id: channelId,
            message: messageRequest.message,
            username: user.username,
            user_id: user._id,
            createdAt: sinon.match.date,
            updatedAt: sinon.match.date,
          }));
      const [message] = await ChatMessage.find({
        message: messageRequest.message,
      });
      await Promise.all([
        expect(serverModel.findById).to.have.been.calledOnce,
        expect(userModel.findById).to.have.been.calledOnce,
        expect(Channel.findById).to.have.been.calledOnce,
        expect(ChatMessage.create).to.have.been.calledOnce,
        expect(message).to.contain({
          username: user.username,
          message: messageRequest.message,
        }),
        expect(message.channel_id.toString()).to.equal(channelId.toString()),
        expect(message.createdAt.getDay.toString()).to.equal(new Date().getDay.toString()),
      ]);
      done();
    }
    sendMessage(io);
  });
  it('succeeds if test socket', (done) => {
    const messageRequest: SendMessageRequest = {
      message: 'hi thar',
      channel_id: channelId.toString(),
      server_id: server._id.toString(),
    };
    sandbox.spy(Channel, 'find');
    sandbox.spy(Channel, 'findById');
    const { io, socket } = createFakeSocketEvent('send-message', messageRequest,
      { user_id: user._id, username: user.username },
      async () => {
        await expect(Channel.find).to.have.been.calledOnce;
        await expect(Channel.findById).not.to.have.been.called;
        done();
      }, result);
    socket.handshake.query = { test: TEST_SECRET };
    sendMessage(io);
  });
  it('does not send if user.joinedServers not includes server_id', (done) => {
    const messageRequest: SendMessageRequest = {
      message: 'hi thar',
      channel_id: channelId.toString(),
      server_id: server._id.toString(),
    };
    const { io, socket } = createFakeSocketEvent('send-message', messageRequest,
      { user_id: user._id, username: user.username },
      onComplete, result);
    sandbox.spy(Channel, 'findById');
    sandbox.spy(ChatMessage, 'create');
    sandbox.spy(userModel, 'findById');
    sandbox.spy(serverModel, 'findById');
    async function onComplete() {
      expect(result).to.have.been
        .calledWith('soft-error', 'You don\'t have permission to send this message.');
      const [message] = await ChatMessage.find({
        message: messageRequest.message,
      });
      await Promise.all([
        expect(serverModel.findById).to.have.been.called,
        expect(userModel.findById).to.have.been.called,
        expect(Channel.findById).to.have.been.calledOnce,
        expect(ChatMessage.create).not.to.have.been.called,
        expect(message).to.be.undefined,
      ]);
      done();
    }
    userModel.findByIdAndUpdate(user._id, {
      $set: {
        joinedServers: []
      }
    }, () => {
      sendMessage(io);
    });
  });
});
