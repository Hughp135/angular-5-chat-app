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

describe('api/servers/invites/post', () => {
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
      .post('/api/servers/invites')
      .send({ server_id: server._id })
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .post('/api/servers/invites')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .send({ server_id: server._id })
      .expect(401);
  });
  it('returns 404 if server does not exist', async () => {
    return supertest(app.listen(null))
      .post('/api/servers/invites')
      .set('Cookie', `jwt_token=${token}`)
      .send({ server_id: '123456781234567812345678' })
      .expect(404);
  });
  it('returns invite id if successful', async () => {
    return supertest(app.listen(null))
      .post('/api/servers/invites')
      .set('Cookie', `jwt_token=${token}`)
      .send({ server_id: server._id })
      .expect(200)
      .then((response) => {
        expect(response.body).to.have.property('invite_id');
        expect(response.body.invite_id).to.be.a('string').with.length.greaterThan(6);
      });
  });
  it('returns existing invited_id if server already has one', async () => {
    server.invite_id = 'someIdHere';
    await server.save();
    return supertest(app.listen(null))
      .post('/api/servers/invites')
      .set('Cookie', `jwt_token=${token}`)
      .send({ server_id: server._id })
      .expect(200)
      .then((response) => {
        expect(response.body).to.have.property('invite_id');
        expect(response.body.invite_id).to.equal('someIdHere');
      });
  });
});
