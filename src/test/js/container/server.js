import { applyServerMixin } from '../../../main/js/container/server'

describe('applyServerMixin', () => {
  it('returns class with promisified close and listen', async () => {
    const listen = sinon.stub().callsFake((_host, _port, cb) => cb())
    const close = sinon.stub().callsFake((cb) => cb())
    class TestClass {}
    TestClass.prototype.listen = listen
    TestClass.prototype.close = close

    const Class = applyServerMixin(TestClass)
    const newClassInstance = new Class()
    const closeResult = newClassInstance.close()
    const listenResult = newClassInstance.listen()

    expect(closeResult).to.be.instanceOf(Promise)
    expect(listenResult).to.be.instanceOf(Promise)
    await Promise.all([closeResult, listenResult])
    expect(listen).to.have.been.called()
    expect(close).to.have.been.called()
  })
})
