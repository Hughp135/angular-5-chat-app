import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import { app } from '../../api-server';

import User from '../../models/user';


const expect = chai.expect;
chai.use(sinonChai);
// tslint:disable:no-unused-expression

describe('api/auth/login', () => {
  const sandbox = sinon.sandbox.create();

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    mongoose.connection.close();
  });
  beforeEach(async () => {
    await User.create({
      username: 'test',
      password: '123456',
    });
  });
  afterEach(async () => {
    await User.remove({});
    sandbox.restore();
  });

  it('username must be string', async () => {
    return supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: {},
        password: null
      })
      .expect(400, {
        error: '"username" must be a string',
      });
  });
  it('username must be provided', async () => {
    return supertest(app.listen(null))
      .post('/api/login')
      .send({
        password: 'hi'
      })
      .expect(400, {
        error: '"username" is required',
      });
  });
  it('password must be provided', async () => {
    return supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'hi',
      })
      .expect(400, {
        error: '"password" is required',
      });
  });
  it('unauthorized if user is not found', async () => {
    const bcryptCompare = sandbox.spy(bcrypt, 'compare');
    const userFind = sandbox.spy(User, 'findOne');
    await supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'hi',
        password: '123456',
      })
      .expect(401, {
        error: 'Username or password incorrect.',
      });
    expect(userFind).to.have.been.calledOnce;
    expect(bcryptCompare).not.to.have.been.called;
  });
  it('unauthorized if password is wrong', async () => {
    const bcryptCompare = sandbox.spy(bcrypt, 'compare');
    const userFind = sandbox.spy(User, 'findOne');
    await supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'test',
        password: '123asd',
      })
      .expect(401, {
        error: 'Username or password incorrect.',
      });
    expect(userFind).to.have.been.calledOnce;
    expect(bcryptCompare).to.have.been.calledOnce;
  });
  it('succeeds with correct credentials', async () => {
    const bcryptCompare = sandbox.spy(bcrypt, 'compare');
    await supertest(app.listen(null))
      .post('/api/login')
      .send({
        username: 'test',
        password: '123456',
      })
      .expect(204);
    expect(bcryptCompare).to.have.been.calledOnce;
  });
});
