import env from '../../env/index.js'

export default class Info {
  handler (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify(env.package))
    res.end()
  }
}
