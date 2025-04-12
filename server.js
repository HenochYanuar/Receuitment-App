require('dotenv').config()
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const path = require('path')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const { err500, err404 } = require('./utils/error')
const { articleRouter } = require('./routers/article.route')
const { authRouter } = require('./routers/auth.route')
const { profileRouter } = require('./routers/profile.route')

const port = process.env.PORT

const server = express()

server.set('view engine', 'ejs')
server.set('views', path.join(__dirname, 'view'))
server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.static(path.join(__dirname, 'public')))

server.use(methodOverride('_method'))

server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())

server.use('/user', authRouter)

server.use(expressLayouts)

server.use('/', articleRouter)

server.use('/user', profileRouter)

server.use((req, res, next) => {
  res.status(404).render('error/error', err404)
})

server.listen(port, () => console.log(`Server is running at http://localhost:${port}`))