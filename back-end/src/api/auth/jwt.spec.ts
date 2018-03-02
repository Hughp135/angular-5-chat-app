import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';
import * as mongoose from 'mongoose';

import { verifyJWT, createJWT } from './jwt';

const expect = chai.expect;
chai.use(sinonChai);
// tslint:disable:no-unused-expression

describe('json web token', () => {
  it('rejects promise if token is invalid', async () => {
    try {
      const decoded = await verifyJWT('123');
      throw new Error('Expected promise to be rejected, instead got: ' + decoded);
    } catch (e) {
      return expect(e.message).to.equal('jwt malformed');
    }
  });
  it('rejects promise if token is expired', async () => {
    const token = createJWT({
      username: 'test',
      user_id: 'id-here',
    }, '1ms');
    const checkTokenSoon = () => {
      const decoded = verifyJWT(token).then(() => {
        throw new Error('Expected promise to be rejected, instead got: ' + decoded);
      }).catch(e => {
        return expect(e.message).to.equal('jwt expired');
      });
    };
    setTimeout(() => {
      checkTokenSoon();
    }, 2);
  });
});
