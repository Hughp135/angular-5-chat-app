import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../api-server';
import { createJWT } from '../auth/jwt';
import User from '../../models/user.model';
import Channel from '../../models/channel.model';
import Server from '../../models/server.model';
// tslint:disable:no-unused-expression

const expect = chai.expect;
chai.use(sinonChai);

describe('api/channels/delete', () => {
  let token;
  let invalidToken;
  let user1;
  let channel1;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
    invalidToken = createJWT({
      username: 'test-user',
      user_id: '123456781234567812345678',
    }, `5s`);
  });
  beforeEach(async () => {
    user1 = await User.create({ username: 'test-user1', password: '123456' });
    token = createJWT({
      username: 'test-user',
      user_id: user1._id,
    }, `3s`);
  });
  after(async () => {
    mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
    await Channel.remove({});
    await Server.remove({});
  });
  it('returns 401 if not logged in', async () => {
    return supertest(app.listen(null))
      .delete('/api/delete-channel/123456781234567812345678')
      .set('Cookie', `jwt_token=`)
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .delete('/api/delete-channel/123456781234567812345678')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(401);
  });
  it('deletes channel', async () => {
    const server = await Server.create({
      owner_id: user1._id,
      name: 'test',
    });
    channel1 = await Channel.create({
      name: 'chantest',
      server_id: server._id,
    });
    return supertest(app.listen(null))
      .delete(`/api/delete-channel/${channel1._id}`)
      .set('Cookie', `jwt_token=${token}`)
      .expect(200)
      .then(response => {
        expect(response.body).to.have.property('channels');
        expect(response.body.channels).to.have.length(0);
      });
  });
  it('returns 400 if channel does not exist', async () => {
    return supertest(app.listen(null))
      .delete('/api/delete-channel/123456781234567812345678')
      .set('Cookie', `jwt_token=${token}`)
      .expect(400);
  });
  it('returns 401 if user is not owner of server', async () => {
    const server = await Server.create({
      owner_id: '123456781234567812345678',
      name: 'test',
    });
    channel1 = await Channel.create({
      name: 'chantest',
      server_id: server._id,
    });
    return supertest(app.listen(null))
      .delete(`/api/delete-channel/${channel1._id}`)
      .set('Cookie', `jwt_token=${token}`)
      .expect(401);
  });
});
