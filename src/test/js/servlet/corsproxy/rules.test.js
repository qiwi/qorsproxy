import Rules, { ANY, SEPARATOR } from '../../../../main/js/servlet/corsproxy/rules.js'

describe('corsproxy.Rules', () => {
  const rules = new Rules()

  it('constructor returns proper instance', () => {
    expect(rules.rules).to.be.an.instanceOf(Map)
  })

  it('`getKey` returns properly formatted map key', () => {
    expect(Rules.getKey()).to.equal(`${ANY}${SEPARATOR}${ANY}${SEPARATOR}${ANY}`)
    expect(Rules.getKey('foo', 'bar', 'baz')).to.equal(`foo${SEPARATOR}bar${SEPARATOR}baz`)
  })

  describe('prototype', () => {
    it('`configuration` assigns new rule map', () => {
      rules.configure([
        {
          from: ['localhost']
        },
        {
          to: ['example.com']
        },
        {
          secrets: ['4e99e8c12de7e01535248d2bac85e732']
        },
        {
          from: 'foobar.com',
          to: ['baz.org', 'qux.org'],
          secret: 'f4091876df6a5d39e6690b7395a95399'
        }
      ])
      expect([...rules.rules.keys()]).to.include(
        'localhost__*__*',
        '*__example.com__*',
        '*__*__4e99e8c12de7e01535248d2bac85e732',
        'foobar.com__baz.org__f4091876df6a5d39e6690b7395a95399',
        'foobar.com__qux.org__f4091876df6a5d39e6690b7395a95399'
      )
      expect(rules.rules.size).to.equal(5)
    })

    describe('`get`', () => {
      it('extracts rule by particular match', () => {
        expect(rules.get('localhost', 'qiwi.com', null)).to.be.an('object')
        expect(rules.get(null, 'example.com', '3cf68317dc5e093c5aba18acba72e38a')).to.be.an('object')
        expect(rules.get('kassa.qiwi.com', null, '4e99e8c12de7e01535248d2bac85e732')).to.be.an('object')
      })

      it('extracts rule by strict match', () => {
        expect(rules.get('foobar.com', 'qux.org', 'f4091876df6a5d39e6690b7395a95399')).to.be.an('object')
      })

      it('return null if no match found', () => {
        expect(rules.get(null, null, '640d91829fccaa0194ad192d484ee8ec')).to.be.null()
        expect(rules.get(null, null, null)).to.be.null()
      })

      it ('returns the best match by priority', () => {
        const rules = new Rules()

        rules.rules.set('*__*__*', 'any-any-any')
        rules.rules.set('origin__host__*', 'origin-host-any')
        rules.rules.set('origin__*__*', 'origin-any-any')
        rules.rules.set('*__host__*', 'any-host-any')

        expect(rules.get('origin')).to.equal('origin-any-any')
        expect(rules.get('origin', 'host')).to.equal('origin-host-any')
        expect(rules.get(null, 'host')).to.equal('any-host-any')
        expect(rules.get()).to.equal('any-any-any')
        expect(rules.get(null, null, 'secret')).to.equal('any-any-any')
      })
    })
  })
})
