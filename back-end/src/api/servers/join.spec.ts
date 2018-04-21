import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../api-server';
import { createJWT } from '../auth/jwt';
import Server from '../../models/server.model';
import User from '../../models/user.model';

const expect = chai.expect;
chai.use(sinonChai);

describe('api/servers/join', () => {
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
      owner_id: '123456781234567812345678',
      name: 'tests',
      invite_id: 'invite1',
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
      .post(`/api/join-server/${server.invite_id}`)
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .post(`/api/join-server/${server.invite_id}`)
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(401);
  });
  it('returns 404 if server does not exist', async () => {
    return supertest(app.listen(null))
      .post(`/api/join-server/123456781234567812345678`)
      .set('Cookie', `jwt_token=${token}`)
      .expect(404);
  });
  it('adds server id to joined_servers if not included', async () => {
    return supertest(app.listen(null))
      .post(`/api/join-server/${server.invite_id}`)
      .set('Cookie', `jwt_token=${token}`)
      .expect(204)
      .then(async () => {
        const userAfter: any = await User.findById(user._id).lean();
        expect(userAfter.joined_servers).to.deep.equal([server._id.toString()]);
      });
  });
  it('doesnt add duplicate id to joined_servers if already joined', async () => {
    user.joined_servers.push(server._id);
    await user.save();
    return supertest(app.listen(null))
      .post(`/api/join-server/${server.invite_id}`)
      .set('Cookie', `jwt_token=${token}`)
      .expect(204)
      .then(async () => {
        const userAfter: any = await User.findById(user._id).lean();
        expect(userAfter.joined_servers).to.deep.equal([server._id.toString()]);
      });
  });
});
