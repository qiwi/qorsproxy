import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset'
import dirtyChai from 'dirty-chai'

chai.use(dirtyChai)
chai.use(sinonChai)
chai.use(chaiSubset)

global.sinon = sinon
