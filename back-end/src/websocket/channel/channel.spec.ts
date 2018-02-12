import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import { createChannel } from './create';
import Channel from '../../models/channel.model';
import Server from '../../models/server.model';

const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

function createFakeSocketEvent(eventName: string, data: any, complete: any) {
  const socket = {
    on: async (event: string, callback: any) => {
      await callback(data);
      complete();
    },
    emit: result,
  };

  const io = {
    on: (event: string, callback: any) => {
      callback(socket);
    },
  };
  return { io, socket };
}

describe('websocket routes: channel', () => {
  let serverId;
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
  });
  afterEach(async () => {
    await Server.remove({});
    await Channel.remove({});
  });
  it('channel/create', (done) => {
    const { io, socket } = createFakeSocketEvent('create-channel', {
      name: 'channel-name',
      server_id: serverId,
    }, () => {
      expect(result).to.have.been
        .calledWith('channel-list',
        sinon.match({
          server_id: serverId,
          channels: [sinon.match({
            name: 'channel-name',
            server_id: serverId,
          })],
        }));
      done();
    });
    createChannel(io);
  });
});
