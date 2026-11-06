import { applyServerMixin } from '../../../main/js/container/server.js'

describe('applyServerMixin', () => {
  it('returns class with promisified close and listen', async () => {
    const listen = vi.fn((_host, _port, cb) => cb())
    const close = vi.fn((cb) => cb())
    class TestClass {}
    TestClass.prototype.listen = listen
    TestClass.prototype.close = close

    const Class = applyServerMixin(TestClass)
    const newClassInstance = new Class()
    const closeResult = newClassInstance.close()
    const listenResult = newClassInstance.listen()

    expect(closeResult).toBeInstanceOf(Promise)
    expect(listenResult).toBeInstanceOf(Promise)
    await Promise.all([closeResult, listenResult])
    expect(listen).toHaveBeenCalled()
    expect(close).toHaveBeenCalled()
  })

  it('rejects on close and listen errors', async () => {
    const error = new Error('boom')
    class TestClass {
      close (cb) { cb(error) }
      listen () { throw error }
    }
    const instance = new (applyServerMixin(TestClass))()

    await expect(instance.close()).rejects.toBe(error)
    await expect(instance.listen()).rejects.toBe(error)
  })
})
