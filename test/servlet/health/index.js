import chai from 'chai';
import chaiSubset from 'chai-subset';
import reqresnext from 'reqresnext';
import {StandardIndicator, Endpoint} from '@qiwi/health-indicator';
import Health from '../../../src/servlet/health';

const { expect } = chai;
chai.use(chaiSubset);

describe('health', () => {
  it('constructor returns proper instance', () => {
    const deps = {}
    const health = new Health(deps)

    expect(health.indicator).to.be.instanceOf(StandardIndicator)
    expect(health.indicator.deps).to.equal(deps)
    expect(health.endpoint).to.be.instanceOf(Endpoint)
  })

  describe('proto', () => {
    describe('handler', () => {
      it('sends proper value to client', () => {
        const {req, res} = reqresnext()
        const dep1 = {health(){ return {status: 'UP'}}}
        const dep2 = {health(){ return {status: 'DOWN', critical: false}}}
        const health = new Health({dep1, dep2})

        health.handler(req, res)

        expect(res.body).to.equal(JSON.stringify({
          deps: {
            dep1: {status: 'UP'},
            dep2: {status: 'DOWN', critical: false}
          },
          status:'UP',
          critical: false
        }))
      })
    })
  })
})
