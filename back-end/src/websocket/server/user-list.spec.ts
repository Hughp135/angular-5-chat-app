import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import Channel from '../../models/channel.model';
import Server from '../../models/server.model';
import User from '../../models/user.model';
import createFakeSocketEvent from '../test_helpers/fake-socket';
import { sendUserList } from './user-list';

const expect = chai.expect;
chai.use(sinonChai);

const io = {
  of: () => ({
    connected: {
      'socket1': {
        claim: {
          user_id: 'userId1',
        }
      }
    },
  }),
};

const socket = {
  emit: sinon.spy(),
};

const server = {
  '_id': 'serverId'
};

describe('websocket channel/user-list', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(User, 'find').callsFake(() => ({
      lean: () => ([
        {
          _id: 'userId1',
          username: 'user1'
        },
        {
          _id: 'userId2',
          username: 'user2'
        }
      ])
    }));
  });
  afterEach(async () => {
    socket.emit.resetHistory();
    sandbox.restore();
  });

  it('server list', async () => {
    await sendUserList(io, socket, server);
    expect(socket.emit).to.have.been.calledWith('server-user-list', {
      server_id: server._id,
      users: [
        {
          _id: 'userId1',
          username: 'user1',
          online: true,
        },
        {
          _id: 'userId2',
          username: 'user2',
          online: false,
        }
      ]
    });
  });
});
