import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { handler } from './leave';

const expect = chai.expect;
chai.use(sinonChai);

describe('websocket/voice-channel/leave', () => {
  const socketLeave = sinon.spy();
  const emitSpy = sinon.spy();
  const socket: any = {
    id: '123',
    claim: {
      user_id: 'userid1',
      username: 'user1',
    },
    leave: (chan, cb) => { socketLeave(chan, cb); cb(); },
  };
  const anotherSocket = {
    id: 'anotherSocket',
    claim: {
      user_id: 'anotherSocketId',
      username: 'anotherSocketName',
    },
  };
  const io: any = {
    of: () => ({
      in: () => ({
        clients: (callback) => callback(null, [socket.id, anotherSocket.id]),
      }),
      connected: {
        [anotherSocket.id]: anotherSocket,
        [socket.id]: socket,
      },
    }),
    in: () => ({ emit: emitSpy }),
  };
  afterEach(() => {
    socketLeave.resetHistory();
    emitSpy.resetHistory();
  });

  it('socket.leave is called with channel id', async () => {
    await handler(io, socket, 'chanId');
    expect(socketLeave).to.have.been.calledWith(`voicechannel-chanId`);
  });
  it('emits user list to other users in channel', async () => {
    await handler(io, socket, 'chanId');
    expect(emitSpy).to.have.been.calledWith('voice-channel-users', {
      channelId: 'chanId',
      users: [
        { _id: 'userid1', socket_id: '123', username: 'user1' },
        {
          _id: 'anotherSocketId',
          socket_id: 'anotherSocket',
          username: 'anotherSocketName',
        },
      ],
    });
  });
});
