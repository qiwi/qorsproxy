import fs from 'node:fs'
import chai from 'chai'
import { temporaryFile } from 'tempy'
import Config, { READY, UPDATE, ERROR } from '../../../main/js/config/index.js'
import ConfigLoader from '../../../main/js/config/loader.js'
import DEFAULTS from '../../../main/js/config/defaults.js'

const { expect } = chai

describe('config', () => {
  const host = '127.0.0.1'
  const port = 8080
  const watch = 1
  const configData = DEFAULTS
  const configDataStr = JSON.stringify(configData)

  describe('default', async () => {
    const config = new Config({ host, port }).load()

    await new Promise((resolve) => config.on(READY, resolve))

    it('exports argv params', () => {
      expect(config.host).to.be.a('string')
      expect(config.port).to.be.a('number')
    })

    describe('prototype', () => {
      it('get returns value by key', () => {
        expect(config.get('log.filename')).to.equal('qors-%DATE%.log')
      })

      it('get returns undefined if key is out of map', () => {
        expect(config.get('foo')).to.be.undefined()
      })

      it('getAll returns entire data', () => {
        expect(config.getAll()).to.be.an('object').that.has.all.keys('crumbs', 'log', 'server', 'rules')
      })
    })
  })

  describe('events', () => {
    it('READY', done => {
      const file = temporaryFile()
      fs.writeFileSync(file, configDataStr)
      const config = new Config({ host, port, watch, config: file })
      const expected = { ...configData,  server: { ...configData.server, host, port }  }

      config
        .on(READY, data => {
          expect(data).to.deep.equal(expected)
          done()
        })
        .load()
    })

    it('UPDATE', done => {
      const file = temporaryFile()
      const config = new Config({ host, port, watch, config: file })
      fs.writeFileSync(file, JSON.stringify({ c: 'c' }))

      config
        .on(UPDATE, data => {
          expect(data).to.own.include({ c: 'c' })
          done()
        })
        .load()
    }).timeout(10_000)

    it('ERROR (read)', done => {
      const file = temporaryFile()
      const config = new Config({ host, port, config: file })
      config
        .on(ERROR, data => {
          expect(data).to.be.an('error')
          expect(data.message).to.equal(`config_loader: read error path=${file}`)
          done()
        })
        .load()
    })

    it('ERROR (parse)', done => {
      const file = temporaryFile()
      fs.writeFileSync(file, 'foo: bar: baz')

      const config = new Config({ host, port, config: file })
      config
        .on(ERROR, data => {
          expect(data).to.be.an('error')
          expect(data.message).to.equal('config_loader: parse error')
          done()
        })
        .load()
    })

    it('ERROR (validate)', done => {
      const file = temporaryFile()
      fs.writeFileSync(file, JSON.stringify({ server: 'foo' }))

      const config = new Config({ host, port, config: file })
      config
        .on(ERROR, data => {
          expect(data).to.be.an('error')
          expect(data.message).to.equal('config_loader: invalid by schema')
          done()
        })
        .load()
    })
  })

  describe('parse', () => {
    it('json', () => {
      expect(ConfigLoader.parse('{"foo": "bar"}')).to.deep.equal({ foo: 'bar' })
    })

    it('yaml', () => {
      expect(ConfigLoader.parse('foo: bar')).to.deep.equal({ foo: 'bar' })
    })

    it('invalid', () => {
      expect(ConfigLoader.parse('foo: bar: baz')).to.be.instanceOf(Error)
    })
  })
})
