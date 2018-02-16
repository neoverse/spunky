/* eslint-disable func-names */

import sinon from 'sinon';
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import chaiEnzyme from 'chai-enzyme';

global.chai = chai;
global.expect = chai.expect;
global.context = describe;

chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiEnzyme());

beforeEach(function () {
  this.sinon = sinon.sandbox.create();
});

afterEach(function () {
  this.sinon.restore();
});
