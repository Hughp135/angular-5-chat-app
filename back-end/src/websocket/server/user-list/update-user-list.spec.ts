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
  beforeEach(() => {
    sandbox.stub(User, 'findById').callsFake(() => ({
      lean: () => ({
        _id: '123',
        username: 'test',
        joinedServers: ['345', '678'],
      })
    }));
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
    await updateUserList('123', io);
    return expect(emit).to.have.been.calledTwice;
  });
});
