import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { handler } from './signal';

const expect = chai.expect;
chai.use(sinonChai);

describe('websocket/webrtc/signal', () => {
  let sandbox, emitSpy, socket;
  before(() => {
    sandbox = sinon.createSandbox();
    emitSpy = sandbox.spy();
    socket = {
      id: 'socket-id-here',
      to: () => ({
        emit: emitSpy,
      }),
    };
  });


  afterEach(() => {
    sandbox.restore();
  });

  it('should send signal to socket id', () => {
    handler(socket, {
      socketId: '123',
      signalData: 'datahere',
    });
    expect(emitSpy).calledWith('signal', {
      signalData: 'datahere', socketId: 'socket-id-here',
    });
  });
  it('should send signal to another socket id', () => {
    socket.id = 'another-id';
    handler(socket, {
      socketId: 'asd',
      signalData: 'datahere2',
    });
    expect(emitSpy).calledWith('signal', {
      signalData: 'datahere2', socketId: 'another-id',
    });
  });
});
