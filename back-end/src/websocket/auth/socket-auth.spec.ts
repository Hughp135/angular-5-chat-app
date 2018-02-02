import { logInAuth } from './socket-auth';
import { createJWT } from '../../api/auth/jwt';

import * as chai from 'chai';
import * as mocha from 'mocha';

const expect = chai.expect;

const logInAuthFunction = logInAuth();

// tslint:disable:no-unused-expression

describe('logInAuth', () => {
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
