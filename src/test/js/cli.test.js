import { readFileSync } from 'node:fs'

vi.mock('../../main/js/app.js', () => ({ App: { main: vi.fn() } }))

const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'))

describe('cli', () => {
  const argv = process.argv

  const run = async (...args) => {
    vi.resetModules()
    process.argv = ['node', 'cli.js', ...args]
    await import('../../main/js/cli.js')

    return (await import('../../main/js/app.js')).App.main
  }

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })
  })

  afterEach(() => {
    process.argv = argv
    vi.restoreAllMocks()
  })

  it('passes parsed flags to the app', async () => {
    const main = await run('-c', 'a.yaml', '--secure.port=9293')

    expect(main).toHaveBeenCalledWith({ config: 'a.yaml', secure: { port: 9293 } })
  })

  it('prints help', async () => {
    await expect(run('--help')).rejects.toThrow('exit')

    expect(process.exit).toHaveBeenCalledWith(0)
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`\n  ${pkg.description}\n\n  Usage\n`))
  })

  it('prints version', async () => {
    await expect(run('--version')).rejects.toThrow('exit')

    expect(console.log).toHaveBeenCalledWith(pkg.version)
  })
})
