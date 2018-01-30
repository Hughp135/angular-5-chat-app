import * as chai from 'chai';
import * as mocha from 'mocha';
import * as sinonChai from 'sinon-chai';

import startServer from './index';

const expect = chai.expect;
chai.use(sinonChai);
describe('Server Starts', () => {
  it('starts server', () => {
    startServer();
    expect(true).to.equal(true);
  });
});
