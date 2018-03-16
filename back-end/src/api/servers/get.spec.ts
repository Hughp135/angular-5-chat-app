import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../api-server';
import { createJWT } from '../auth/jwt';
import Server from '../../models/server.model';
import User from '../../models/user.model';

// tslint:disable:no-unused-expression

const expect = chai.expect;
chai.use(sinonChai);

describe('api/servers/get', () => {
  let token;
  let invalidToken;
  let user;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
    invalidToken = createJWT({
      username: 'test-user',
      user_id: '123456781234567812345678',
    }, `5s`);
  });
  beforeEach(async () => {
    user = await User.create({ username: 'test-user', password: '123456' });
    token = createJWT({
      username: 'test-user',
      user_id: user._id,
    }, `3s`);
  });
  after(async () => {
    mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    await Server.remove({});
  });
  it('returns 401 if not logged in', async () => {
    return supertest(app.listen(null))
      .get('/api/servers')
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .get('/api/servers')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(401, {
        error: 'User not found.',
      });
  });
  it('returns empty server list if user has no servers', async () => {
    return supertest(app.listen(null))
      .get('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .expect(200, {
        servers: [],
      });
  });
  it('returns servers that user has joined', async () => {
    const server = await Server.create({
      name: 'namehere',
      owner_id: user._id,
    });
    const server2 = await Server.create({
      name: 'namehere2',
      owner_id: user._id,
    });
    user.joined_servers = [ server._id, server2._id ];
    await user.save();
    return supertest(app.listen(null))
      .get('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .expect(200, {
        servers: [
          JSON.parse(JSON.stringify(server)),
          JSON.parse(JSON.stringify(server2)),
        ],
      });
  });
});
