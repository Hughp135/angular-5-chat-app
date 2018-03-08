import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../api-server';
import { createJWT } from '../auth/jwt';
import Server from '../../models/server.model';
import User from '../../models/user.model';
import * as fs from 'fs';

// tslint:disable:no-unused-expression

const expect = chai.expect;
chai.use(sinonChai);

describe('api/servers/post', () => {
  let token;
  let invalidToken;
  let user;
  const sandbox = sinon.createSandbox();

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
    sandbox.restore();
  });
  it('returns 401 if not logged in', async () => {
    return supertest(app.listen(null))
      .post('/api/servers')
      .send({})
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 401 if user does not exist', async () => {
    return supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .send({})
      .expect(401, {
        error: 'User not found.',
      });
  });
  it('returns 400 with invalid name', async () => {
    return supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .send({})
      .expect(400, {
        error: 'Invalid server name. Must be at least 3 characters and max 30 characters long.',
      });
  });
  it('returns 400 with invalid icon', async () => {
    return supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .send({name: 'asd', icon: 'badicon'})
      .expect(400, {
        error: 'Uploaded Image is too large or in an invalid format.',
      });
  });
  it('creates a server', async () => {
    await supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .send({
        name: 'Automated Test Server'
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.server).to.exist;
        expect(body.server.name).to.equal('Automated Test Server');
      });
    const server: any = await Server.findOne().lean();
    expect(server).to.exist;
    expect(server.name).to.equal('Automated Test Server');
    expect(server.owner_id.toString()).to.equal(user._id.toString());
    const usr: any = await User.findOne({ '_id': user._id }).lean();
    expect(usr.joined_servers).to.have.lengthOf(1);
    expect(usr.joined_servers[0].toString()).to.equal(server._id.toString());
  });
  it('will not allow user to have more than 1 server with the same name', async () => {
    await supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .send({
        name: 'Automated Test Server'
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.server).to.exist;
        expect(body.server.name).to.equal('Automated Test Server');
      });
    await supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .send({
        name: 'Automated Test Server'
      })
      .expect(400, {
        error: 'You already own a server with the same name. Please choose another name or edit your existing server.',
      });
    const usr: any = await User.findOne({ '_id': user._id }).lean();
    expect(usr.joined_servers).to.have.lengthOf(1);
  });
  it('will not allow user to create more than 3 total servers', async () => {
    for (let i = 0; i < 3; i++) {
      await supertest(app.listen(null))
        .post('/api/servers')
        .set('Cookie', `jwt_token=${token}`)
        .send({
          name: 'Automated Test Server ' + i
        })
        .expect(200);
    }
    await supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .send({
        name: 'Automated Test Server'
      })
      .expect(400, {
        error: 'You can only own a maximum of 3 servers. Please delete or edit an existing server before creating a new one',
      });
    const usr: any = await User.findOne({ '_id': user._id }).lean();
    expect(usr.joined_servers).to.have.lengthOf(3);
  });
  it('if icon is not saved to file still return 200', async () => {
    sandbox.stub(fs, 'writeFile')
      .callsArgWith(3, true);
    await supertest(app.listen(null))
      .post('/api/servers')
      .set('Cookie', `jwt_token=${token}`)
      .send({
        name: 'Automated Test Server',
        icon: 'someIconHere',
      })
      .expect(200);
    const server: any = await Server.findOne().lean();
    expect(server).to.exist;
  });
});
