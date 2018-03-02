import { logInAuth } from './socket-auth';
import { createJWT } from '../../api/auth/jwt';
import User from '../../models/user.model';
import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as config from 'config';

const TEST_SECRET = config.get('TEST_SOCKET_SECRET');
const expect = chai.expect;

const logInAuthFunction = logInAuth(null);

// tslint:disable:no-unused-expression

describe('websocket/socket-auth', () => {
  const sandbox = sinon.createSandbox();
  const user = new User({
    _id: '123123123',
    username: 'test_user1',
  });
  beforeEach(() => {
    sandbox.stub(User, 'find').callsFake(() => ({
      lean: () => [user],
    }));
    sandbox.stub(User, 'findById').callsFake(() => ({
      lean: () => user,
    }));
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('succeeds for test socket connections with query.test', async () => {
    const fakeSocket = {
      handshake: {
        query: {
          test: TEST_SECRET,
        }
      }
    };

    const cb = result => {
      expect(result).to.be.undefined;
    };

    await logInAuthFunction(fakeSocket, cb);
  });
  it('succeeds with valid token', async () => {
    const validToken = createJWT({ username: 'hi' }, '1s');
    const fakeSocket = {
      handshake: {
        headers: {
          cookie: `jwt_token=${validToken};`
        }
      }
    };

    const cb = result => {
      expect(result).to.be.undefined;
    };

    await logInAuthFunction(fakeSocket, cb);
  });
  it('fails with invalid token', async () => {
    const fakeSocket = {
      handshake: {
        headers: {
          cookie: `jwt_token=12345;`
        }
      }
    };
    const cb = result => {
      expect(result.message).to.equal('Invalid token');
    };

    await logInAuthFunction(fakeSocket, cb);
  });
  it('fails with no cookies set', async () => {
    const fakeSocket = {
      handshake: {
        headers: {
        }
      }
    };
    const cb = result => {
      expect(result.message).to.equal('No token provided');
    };

    await logInAuthFunction(fakeSocket, cb);
  });
  it('fails with empty token', async () => {
    const fakeSocket = {
      handshake: {
        headers: {
          cookie: 'jwt_token='
        }
      }
    };
    const cb = result => {
      expect(result.message).to.equal('No token provided');
    };

    await logInAuthFunction(fakeSocket, cb);
  });
});
