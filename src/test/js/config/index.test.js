import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import Config, { READY, UPDATE, ERROR } from '../../../main/js/config/index.js'
import ConfigLoader from '../../../main/js/config/loader.js'
import DEFAULTS from '../../../main/js/config/defaults.js'

const temporaryFile = () => path.join(os.tmpdir(), randomUUID())
const once = (config, event) => new Promise(resolve => config.on(event, resolve).load())

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
      expect(config.host).toBeTypeOf('string')
      expect(config.port).toBeTypeOf('number')
    })

    describe('prototype', () => {
      it('get returns value by key', () => {
        expect(config.get('log.filename')).toBe('qors-%DATE%.log')
      })

      it('get returns undefined if key is out of map', () => {
        expect(config.get('foo')).toBeUndefined()
      })

      it('getAll returns entire data', () => {
        expect(Object.keys(config.getAll()).toSorted()).toEqual(['crumbs', 'log', 'rules', 'server'])
      })
    })
  })

  describe('events', () => {
    it('READY', async () => {
      const file = temporaryFile()
      fs.writeFileSync(file, configDataStr)
      const config = new Config({ host, port, watch, config: file })
      const expected = { ...configData, server: { ...configData.server, host, port } }

      expect(await once(config, READY)).toEqual(expected)
      fs.unwatchFile(file)
    })

    it('UPDATE', async () => {
      const file = temporaryFile()
      fs.writeFileSync(file, JSON.stringify({}))

      const config = new Config({ host, port, watch, config: file })
      const updated = new Promise(resolve => config.on(UPDATE, resolve))

      config.load()
      setTimeout(() => {
        fs.promises.writeFile(file, JSON.stringify({ c: 'c' }))
      }, 500)

      expect(await updated).toMatchObject({ c: 'c' })
      fs.unwatchFile(file)
    }, 5000) // fs.watchFile polls every `watch` seconds

    it('ERROR (read)', async () => {
      const file = temporaryFile()
      const error = await once(new Config({ host, port, config: file }), ERROR)

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe(`config_loader: read error path=${file}`)
    })

    it('ERROR (parse)', async () => {
      const file = temporaryFile()
      fs.writeFileSync(file, 'foo: bar: baz')

      const error = await once(new Config({ host, port, config: file }), ERROR)

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('config_loader: parse error')
    })

    it('ERROR (validate)', async () => {
      const file = temporaryFile()
      fs.writeFileSync(file, JSON.stringify({ server: 'foo' }))

      const error = await once(new Config({ host, port, config: file }), ERROR)

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('config_loader: invalid by schema')
    })
  })

  describe('parse', () => {
    it('json', () => {
      expect(ConfigLoader.parse('{"foo": "bar"}')).toEqual({ foo: 'bar' })
    })

    it('yaml', () => {
      expect(ConfigLoader.parse('foo: bar')).toEqual({ foo: 'bar' })
    })

    // Config format contract: guards against YAML parser upgrades that change loaded values
    it('yaml merge keys', () => {
      const yaml = [
        'base: &base',
        "  from: ['*']",
        '  to: [example.com]',
        'rules:',
        '  a:',
        '    <<: *base',
        "    paths: ['/a']"
      ].join('\n')

      expect(ConfigLoader.parse(yaml).rules.a).toEqual({ from: ['*'], to: ['example.com'], paths: ['/a'] })
    })

    it('empty yaml', () => {
      expect(ConfigLoader.parse('')).toBeUndefined()
      expect(ConfigLoader.parse('# no rules yet')).toBeNull()
    })

    it('invalid', () => {
      expect(ConfigLoader.parse('foo: bar: baz')).toBeInstanceOf(Error)
    })
  })
})
