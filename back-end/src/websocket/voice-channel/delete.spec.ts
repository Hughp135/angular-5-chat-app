import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import { handler } from './delete';
import Server from '../../models/server.model';
import voiceChannelModel from '../../models/voice-channel.model';
import serverModel from '../../models/server.model';

const expect = chai.expect;
chai.use(sinonChai);

describe('websocket voice-channel/delete', () => {
  const result = sinon.spy();
  const sandbox = sinon.createSandbox();
  let io, socket;
  const ioEmit = sandbox.spy();
  let server;

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

    io = {
      in: () => ({
        emit: ioEmit,
      }),
    };

    socket = {
      handshake: { query: {} },
      claim: {
        user_id: '123456781234567812345678',
      },
      emit: sandbox.spy(),
    };

  });
  afterEach(async () => {
    await Server.remove({});
    await voiceChannelModel.remove({});
    result.resetHistory();
    sandbox.restore();
  });
  it('returns soft-error if channel does not exist', async () => {
    await handler('123456781234567812345678', io, socket);
    expect(socket.emit).calledWith('soft-error', 'This channel has already been deleted');
    // tslint:disable-next-line:no-unused-expression
    expect(ioEmit).not.called;
  });
  it('returns soft-error if user not owner of server', async () => {
    const server2 = await serverModel.create({
      owner_id: '223456781234567812345678',
      name: 'lulzserver',
    });
    const channel = await voiceChannelModel.create({
      server_id: server2._id,
      name: 'testchAn',
    });
    await handler(channel._id, io, socket);

    expect(socket.emit).calledWith('soft-error', 'You must be the server owner to delete a channel');
    // tslint:disable-next-line:no-unused-expression
    expect(ioEmit).not.called;
  });
  it('deletes channel and emits channel-list', async () => {
    const channel = await voiceChannelModel.create({
      server_id: server._id,
      name: 'testchAn',
    });
    await handler(channel._id, io, socket);

    const channelUpdated: any = await voiceChannelModel.findOne({}).lean();

    expect(channelUpdated).to.equal(null);
    expect(ioEmit).to.have.been.calledWith('channel-list', {
      server_id: server._id,
      channels: [],
      voiceChannels: [],
    });
  });
});
