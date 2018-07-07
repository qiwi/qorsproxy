import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset';

chai.use(sinonChai);
chai.use(chaiSubset);

global.sinon = sinon;
