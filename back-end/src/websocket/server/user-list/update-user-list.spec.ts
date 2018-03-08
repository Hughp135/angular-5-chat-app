import { updateUserList } from './update-user-list';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import User from '../../../models/user.model';

const expect = chai.expect;
chai.use(sinonChai);

describe('websocket/server/update-user-list', () => {
  const sandbox = sinon.createSandbox();
  let io;
  let emit;
  let user;
  beforeEach(() => {
    user = new User({
      _id: '123',
      username: 'test',
      joined_servers: ['345', '678'],
    });
    emit = sandbox.spy();
    io = {
      in: () => ({
        emit,
      })
    };
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('emits update user list to correct servers', async () => {
    await updateUserList(user, io);
    return expect(emit).to.have.been.calledTwice;
  });
});
