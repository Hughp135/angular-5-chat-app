import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../../api-server';
import { createJWT } from '../../auth/jwt';
import Server from '../../../models/server.model';
import User from '../../../models/user.model';

const expect = chai.expect;
chai.use(sinonChai);

describe('api/servers/invites/get', () => {
  let token;
  let invalidToken;
  let user;
  let server;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
    invalidToken = createJWT({
      username: 'invalid-user',
      user_id: '123456781234567812345678',
    }, `5s`);
  });
  beforeEach(async () => {
    user = await User.create({ username: 'test-user', password: '123456' });
    token = createJWT({
      username: 'test-user',
      user_id: user._id,
    }, `3s`);
    server = await Server.create({
      owner_id: user._id,
      name: 'test',
      invite_id: '123',
    });
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
      .get('/api/servers/invites/1')
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .get('/api/servers/invites/1')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(401);
  });
  it('returns 404 if server invite not found', async () => {
    return supertest(app.listen(null))
      .get('/api/servers/invites/1')
      .set('Cookie', `jwt_token=${token}`)
      .expect(404);
  });
  it('returns server if invite id found', async () => {
    return supertest(app.listen(null))
      .get('/api/servers/invites/123')
      .set('Cookie', `jwt_token=${token}`)
      .expect(200, {
        _id: server._id.toString(),
        name: 'test',
        invite_id: '123',
      });
  });
});
