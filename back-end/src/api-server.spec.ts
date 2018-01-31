import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';

import { app } from './api-server';

const expect = chai.expect;
chai.use(sinonChai);

const server = app.listen(5027);

describe('Server Starts', () => {
  after(() => {
    server.close();
  });
  it('starts server', async () => {
    await supertest(server);
    expect(true).to.equal(true);
  });
});
