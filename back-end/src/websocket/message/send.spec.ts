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

const expect = chai.expect;
chai.use(sinonChai);

const result = sinon.spy();

describe('websocket message/send', () => {
  let channelId;
  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    const channel = await Channel.create({
      name: 'test-channel',
      server_id: '123456781234567812345678',
    });
    channelId = channel._id;
  });
  afterEach(async () => {
    await Channel.remove({});
    await ChatMessage.remove({});
    result.resetHistory();
  });
  it('sends a message', (done) => {
    const messageRequest: SendMessageRequest = {
      message: 'hi thar',
      channel_id: channelId,
    };
    const { io, socket } = createFakeSocketEvent('send-message', messageRequest,
      { user_id: '123456781234567812345678', username: 'userName' },
      onComplete, result);
    sendMessage(io);
    function onComplete() {
      expect(result).to.have.been
        .calledWith('chat-message',
        sinon.match({
          channel_id: channelId,
          message: messageRequest.message,
          username: 'userName',
          user_id: '123456781234567812345678',
          createdAt: sinon.match.date,
          updatedAt: sinon.match.date,
        }));
      done();
    }
  });
});
