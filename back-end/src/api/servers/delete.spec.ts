import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../api-server';
import { createJWT } from '../auth/jwt';
import Server from '../../models/server.model';
import User from '../../models/user.model';
import { ObjectId } from 'bson';

const expect = chai.expect;
chai.use(sinonChai);

describe('api/server/delete', () => {
  let token;
  let invalidToken;
  let user;

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
      .post('/api/delete-server/123')
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .post('/api/delete-server/123')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(401);
  });
  it('does not delete server if user is not owner', async () => {
    const server = await Server.create({
      name: 'namehere',
      owner_id: new ObjectId(),
    });
    return supertest(app.listen(null))
      .post(`/api/delete-server/${server._id}`)
      .set('Cookie', `jwt_token=${token}`)
      .expect(400, {
        error: 'Only the owner can delete a server.',
      });
  });
  it('deletes server', async () => {
    const server = await Server.create({
      name: 'namehere',
      owner_id: user._id,
    });
    return supertest(app.listen(null))
      .post(`/api/delete-server/${server._id}`)
      .set('Cookie', `jwt_token=${token}`)
      .expect(400);
  });
});
