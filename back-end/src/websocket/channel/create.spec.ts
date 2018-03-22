import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import { createChannel, handler as createChannelHandler } from './create';
import Channel from '../../models/channel.model';
import Server from '../../models/server.model';
import createFakeSocketEvent from '../test_helpers/fake-socket';

const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

describe('websocket channel/create', () => {
  let serverId;
  const sandbox = sinon.createSandbox();
  let io, socket;
  const ioEmit = sandbox.spy();

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
    await Channel.remove({});
    result.resetHistory();
    sandbox.restore();
  });
  it('channel/create success', async () => {
    const emit = sandbox.spy();
    await createChannelHandler(io, socket, {
      name: 'channel-name',
      server_id: serverId,
    });
    const channel: any = await Channel.findOne({}).lean();

    expect(channel).not.to.equal(null);
    expect(channel.name).to.equal('channel-name');
    expect(ioEmit).to.have.been
      .calledWith('channel-list', {
        server_id: serverId,
        channels: [{
          _id: channel._id.toString(),
          name: 'channel-name',
          server_id: serverId.toString(),
          last_message: undefined,
        }],
      });
  });
  it('channel/create fails if no server_id given', async () => {
    await createChannelHandler(io, socket, {
      name: 'channel-name',
      server_id: undefined,
    });

    expect(socket.emit).to.have.been
      .calledWith('soft-error', 'Server not found.');
  });
  it('channel/create fails if server.owner_id does not match socket.claim.user_id', async () => {
    socket.claim.user_id = '999996781234567812345678';
    await createChannelHandler(io, socket, {
      name: 'channel-name',
      server_id: serverId,
    });

    expect(socket.emit).to.have.been
      .calledWith('soft-error', 'You do not have permission to add a channel.');
  });
});
