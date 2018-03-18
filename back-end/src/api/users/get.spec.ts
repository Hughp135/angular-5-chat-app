import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { app } from '../../api-server';
import { createJWT } from '../auth/jwt';
import User from '../../models/user.model';
import { ObjectId } from 'bson';
// tslint:disable:no-unused-expression

const expect = chai.expect;
chai.use(sinonChai);

describe('api/users/get', () => {
  let token;
  let invalidToken;
  let user;

  before(async () => {
    await mongoose.connect('mongodb://localhost/myapp-test');
    invalidToken = createJWT(
      {
        username: 'test-user',
        user_id: new ObjectId(),
      },
      `5s`,
    );
  });
  beforeEach(async () => {
    user = await User.create({ username: 'test-user', password: '123456' });
    token = createJWT(
      {
        username: 'test-user',
        user_id: user._id,
      },
      `3s`,
    );
  });
  after(async () => {
    mongoose.connection.close();
  });
  afterEach(async () => {
    await User.remove({});
  });
  it('returns 401 if not logged in', async () => {
    return supertest(app.listen(null))
      .get('/api/users/randomstring')
      .set('Cookie', 'jwt_token=')
      .expect(401, {
        error: 'You must be logged in.',
      });
  });
  it('returns 404 if user not found', async () => {
    return supertest(app.listen(null))
      .get('/api/users/badname')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(404, {
        error: 'User not found.',
      });
  });
  it('returns user if username matches exactly', async () => {
    return supertest(app.listen(null))
      .get('/api/users/test-user')
      .set('Cookie', `jwt_token=${invalidToken}`)
      .expect(200, {
        user: {
          _id: user._id.toString(),
          username: 'test-user',
        },
      });
  });
});
