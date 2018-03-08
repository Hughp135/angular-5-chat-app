import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import User from './user.model';

const expect = chai.expect;
chai.use(sinonChai);
// tslint:disable:no-unused-expression
describe('models/user', () => {
  const sandbox = sinon.sandbox.create();

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    await mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    sandbox.restore();
  });
  it('doesn\'t re-hash password on save if pw not changed', async () => {
    const bcryptHashSpy = sandbox.spy(bcrypt, 'hash');
    const user: any = await User.create({
      username: 'test',
      password: '123456',
    });
    user.username = 'test2';
    await user.save();
    expect(bcryptHashSpy).to.have.been.calledOnce;

    const savedUser: any = await User.findOne().lean();
    expect(savedUser.username).to.equal('test2');
  });
  it('username must be unique', async () => {
    await User.create({
      username: 'test',
      password: '123456'
    });
    async function create2ndUser() {
      await User.create({
        username: 'test',
        password: '123456'
      });
    }
    try {
      await User.create({
        username: 'test',
        password: '123456'
      });
    } catch (e) {
      return expect(e.message).to.equal('duplicate username');
    }
    throw new Error('User create worked when it shouldn\'t have');
  });
  it('creates user with friend requests', async () => {
    const objectId = mongoose.Types.ObjectId();
    const user = await User.create({
      username: 'test',
      password: '123456',
      friend_requests: [{
        type: 'outgoing',
        user_id: objectId,
      }]
    });

    expect(user.friend_requests[0].type).to.equal('outgoing');
    expect(user.friend_requests[0].user_id).to.equal(objectId);
  });
  it('creates with user with joined_servers / friends', async () => {
    const user = await User.create({
      username: 'test',
      password: '123456',
      joined_servers: ['123', '456'],
      friends: ['asd', 'fgh'],
    });
    expect(user.joined_servers).to.deep.equal(['123', '456']);
    expect(user.friends).to.deep.equal(['asd', 'fgh']);
  });
});
