import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { handler } from './join';
import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';
import voiceChannelModel from '../../models/voice-channel.model';
import userModel from '../../models/user.model';

const expect = chai.expect;
chai.use(sinonChai);

describe('websocket/voice-channel/join', () => {
  const sandbox = sinon.createSandbox();
  let socketEmit, anotherSocketEmit, socketJoin;
  let io, socket;
  let anotherSocket;
  let user, channel;
  let serverId;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    socketEmit = sandbox.spy();
    anotherSocketEmit = sandbox.spy();
    socketJoin = sandbox.spy();
    serverId = new ObjectId();
    channel = await voiceChannelModel.create({
      name: 'channel1',
      server_id: serverId,
    });
    user = await userModel.create({
      username: 'user1',
      joined_servers: [serverId.toString()],
      password: 'asdasd',
    });
    serverId = new ObjectId();
    socket = {
      id: '123',
      emit: socketEmit,
      join: socketJoin,
      claim: {
        user_id: user._id.toString(),
        username: 'user1',
      },
    };
    anotherSocket = {
      id: 'anotherSocket',
      emit: anotherSocketEmit,
      claim: {
        user_id: 'anotherSocketId',
        username: 'anotherSocketName',
      },
    };
    io = {
      of: () => ({
        in: () => ({
          clients: (callback) => callback(null, [socket.id, anotherSocket.id]),
        }),
        connected: {
          [anotherSocket.id]: anotherSocket,
          [socket.id]: socket,
        },
      }),
    };
  });


  afterEach(async () => {
    sandbox.restore();
    await userModel.remove({});
    await voiceChannelModel.remove({});
  });

  it('emits soft-error if channel does not exist', async () => {
    user.joined_servers = [];
    await user.save();
    await handler(io, socket, new ObjectId().toHexString());
    // tslint:disable-next-line:no-unused-expression
    expect(socketEmit).calledOnce;
    expect(socketEmit).calledWith('soft-error', 'This voice channel no longer exists');
  });
  it('emits soft-error if user is not in server', async () => {
    user.joined_servers = [];
    await user.save();
    await handler(io, socket, channel._id.toString());
    // tslint:disable-next-line:no-unused-expression
    expect(socketEmit).calledOnce;
    expect(socketEmit).calledWith('soft-error', 'You don\'t have permission to join this server.');
  });
  it('socket joins voice channel with given id', async () => {
    await handler(io, socket, channel._id.toString());
    expect(socketJoin).to.have.been.calledWith(`voicechannel-${channel._id}`);
  });
  it('emits voice-channel-users to other users in channel', async () => {
    await handler(io, socket, channel._id.toString());
    expect(anotherSocketEmit).to.have.been.calledWith('voice-channel-users', {
      channelId: channel._id.toString(),
      users: [
        { _id: user._id.toString(), socket_id: '123', username: 'user1' },
        {
          _id: 'anotherSocketId',
          socket_id: 'anotherSocket',
          username: 'anotherSocketName',
        },
      ],
    });
  });
  it('emits joined-voice-channel to user', async () => {
    await handler(io, socket, channel._id.toString());
    expect(socketEmit).calledWith('joined-voice-channel', {
      channelId: channel._id.toString(),
      users: [
        { _id: user._id.toString(), socket_id: '123', username: 'user1' },
        {
          _id: 'anotherSocketId',
          socket_id: 'anotherSocket',
          username: 'anotherSocketName',
        },
      ],
    });
  });
});
