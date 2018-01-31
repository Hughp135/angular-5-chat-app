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
    mongoose.connection.close();
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
});
