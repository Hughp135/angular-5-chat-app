import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';

import User from '../../models/user.model';
import { handler } from './get-chat-messages';
import chatmessageModel from '../../models/chatmessage.model';

const expect = chai.expect;
chai.use(sinonChai);



describe('websocket channel/get-chat-messages', () => {
  const result = sinon.spy();
  let user;
  const sandbox = sinon.createSandbox();
  let message;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  beforeEach(async () => {
    user = await User.create({ username: 'test-user1', password: '123456' });
    message = await chatmessageModel.create({
      channel_id: '123456781234567812345678',
      message: 'hi',
      user_id: user._id,
      username: user.username,
    });
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    await chatmessageModel.remove({});
    result.resetHistory();
    sandbox.restore();
  });
  it('returns chat message when before date in future', async () => {
    const socket = {
      claim: { user_id: user._id },
      emit: sandbox.spy(),
      rooms: {},
    };
    const date = new Date();
    date.setHours(date.getHours() + 2);
    const req = {
      channel_id: message.channel_id,
      before: date,
    };


    await handler(req, socket);
    expect(socket.emit).to.have.been
      .calledWithMatch('got-chat-messages', [
        sinon.match((msg) => msg._id.toString() === message._id.toString()),
      ]);
  });
  it('doesnt return chat message when before date is in past', async () => {
    const socket = {
      claim: { user_id: user._id },
      emit: sandbox.spy(),
      rooms: {},
    };
    const date = new Date();
    date.setHours(date.getHours() - 2);
    const req = {
      channel_id: message.channel_id,
      before: date,
    };


    await handler(req, socket);
    expect(socket.emit).to.have.been
      .calledWithMatch('got-chat-messages', []);
  });
});
