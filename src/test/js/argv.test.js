import { parseArgv } from '../../main/js/argv.js'

// CLI contract, as the former meow setup produced it
describe('parseArgv', () => {
  const cases = [
    [[], {}],
    [['-c', 'a.json', '-p', '8080', '-h', 'localhost', '-w', '1'], { config: 'a.json', port: '8080', host: 'localhost', watch: '1' }],
    [['-p=8080', '-w=1000'], { port: '8080', watch: '1000' }],
    [['--config=a.yaml', '--port=8080', '--secure.port=9293', '--secure.cert=c.pem', '--secure.key=k.pem'], { config: 'a.yaml', port: '8080', secure: { port: 9293, cert: 'c.pem', key: 'k.pem' } }],
    [['--secure.port', '9293', '--secure.key', 'k.pem'], { secure: { port: 9293, key: 'k.pem' } }],
    [['--port', '08080'], { port: '08080' }],
    [['--watch'], { watch: '' }],
    [['--foo-bar=1', '--unknown'], { fooBar: 1, unknown: true }],
    [['--no-foo'], { foo: false }],
    [['--x.y.z=1'], { x: { y: { z: 1 } } }],
    [['positional', '--port=1'], { port: '1' }],
    [['--', '--port=1'], {}],
    [['--help'], { help: true }],
    [['--version'], { version: true }],
  ]

  cases.forEach(([argv, flags]) => {
    it(argv.join(' ') || '<none>', () => {
      expect(parseArgv(argv)).toEqual(flags)
    })
  })

  it('ignores prototype keys', () => {
    expect(parseArgv(['--__proto__.polluted=1', '--secure.constructor.x=1'])).toEqual({})
    expect({}.polluted).toBeUndefined()
  })
})
