const jwt = require('jsonwebtoken')
const { secret } = require('../config/jwt')

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token_user

  if (token) {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(403)
      }

      if (user.role !== 'user') {
        return res.status(403).send('Forbidden: Users only')
      }

      req.user = user 
      next()
    })
  } else {
    res.status(401).redirect('/user/login')  
  }
}

module.exports = authenticateJWT