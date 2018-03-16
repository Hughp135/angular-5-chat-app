import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as supertest from 'supertest';

import { app } from './api-server';

const expect = chai.expect;
chai.use(sinonChai);

describe('Server Starts', () => {
  it('starts server', async () => {
    await supertest(app.listen(null));
    expect(true).to.equal(true);
  });
});
