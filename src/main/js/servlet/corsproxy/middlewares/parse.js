import parse from '../parse.js'

export default (req, res, next) => {
  const {from ,to, secret} = parse(req)

  req.to = to
  req.from = from
  req.secret = secret

  next()
}
