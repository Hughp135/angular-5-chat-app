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

const server = app.listen(8000);
const sandbox = sinon.sandbox.create();

describe('api/auth/register', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
  });
  after(async () => {
    mongoose.connection.close();
    server.close();
  });
  afterEach(async () => {
    await User.remove({});
    sandbox.restore();
  });
  it('returns 400 with invalid data', async () => {
    return supertest(server)
      .post('/api/register')
      .send({})
      .expect(400);
  });
  it('username should be at least 3 characters', async () => {
    return supertest(server)
      .post('/api/register')
      .send({
        username: '12',
        password: '123456',
      })
      .expect(400);
  });
  it('password should be at least 6 characters', async () => {
    return supertest(server)
      .post('/api/register')
      .send({
    username: '123',
        password: '12345',
      })
      .expect(400);
  });
  it('should create user on success', async () => {
    const result = await supertest(server)
      .post('/api/register')
      .send({
        username: '123',
        password: '123456',
      })
      .expect(204);
    const user: any = await User.findOne().lean();
    expect(user.username).to.equal('123');
    bcrypt.compare('123456', user.password, function (err, res) {
      expect(res).to.equal(true);
    });
  });
});
