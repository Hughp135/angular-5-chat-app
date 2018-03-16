import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as winston from 'winston';

import { app } from '../../api-server';

import User from '../../models/user.model';

// Disable winston logging during test sin ce it's annoying.
winston.configure({ transports: [] });

// tslint:disable:no-unused-expression

const expect = chai.expect;
chai.use(sinonChai);

describe('api/auth/register', () => {
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
  it('returns 400 with invalid data', async () => {
    return supertest(app.listen(null))
      .post('/api/register')
      .send({})
      .expect(400, {
        error: '"username" is required',
      });
  });
  it('username should be at least 3 characters', async () => {
    return supertest(app.listen(null))
      .post('/api/register')
      .send({
        username: '12',
        password: '123456',
        password_confirm: '123456',
      })
      .expect(400, { error: '"username" length must be at least 3 characters long' });
  });
  it('password should be at least 6 characters', async () => {
    return supertest(app.listen(null))
      .post('/api/register')
      .send({
        username: '123',
        password: '12345',
        password_confirm: '12345',
      })
      .expect(400, { error: '"password" length must be at least 6 characters long' });
  });
  it('username must be unique', async () => {
    const spy = sandbox.spy(bcrypt, 'hash');
    await User.create({
      username: 'someUsername',
      password: '123456',
      password_confirm: '123456',
    });
    const result = await supertest(app.listen(null))
      .post('/api/register')
      .send({
        username: 'someUsername',
        password: 'irrelevant',
        password_confirm: 'irrelevant',
      })
      .expect(400, { error: 'Username is already taken.' });
    expect(spy).to.have.been.calledOnce;
  });
  it('returns 500 if unable to create user', async () => {
    sandbox.stub(User, 'create')
      .throws(new Error());
    const result = await supertest(app.listen(null))
      .post('/api/register')
      .send({
        username: 'someUsername',
        password: 'irrelevant',
        password_confirm: 'irrelevant',
      })
      .expect(500, {
        error: 'Sorry, a server error occured. Please try again later',
      });
  });
  it('should create user', async () => {
    const result = await supertest(app.listen(null))
      .post('/api/register')
      .send({
        username: '123',
        password: '123456',
        password_confirm: '123456',
      })
      .expect(200, { success: true });

    const user: any = await User.findOne().lean();
    expect(user).to.exist;
    expect(user.username).to.equal('123');
    expect(user.password).not.to.be.empty; // password should be hashed
  });
  it('password should be hashed', async () => {
    const hashFunc = sandbox.spy(bcrypt, 'hash');
    const result = await supertest(app.listen(null))
      .post('/api/register')
      .send({
        username: '123',
        password: '123456',
        password_confirm: '123456',
      })
      .expect(200, { success: true });
    expect(hashFunc).to.have.been.calledOnce;

    const user: any = await User.findOne().lean();
    expect(user).to.exist;
    expect(user.username).to.equal('123');
    expect(user.password).not.to.equal('123456'); // password should be hashed
    bcrypt.compare('123456', user.password, function (err, res) {
      expect(res).to.equal(true);
    });
  });
});
