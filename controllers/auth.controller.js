const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { secret, expiresIn } = require('../config/jwt')
const { err500, err404 } = require('../utils/error')
const userModel = require('../models/user.model')
const idCreator = require('../utils/idCreator')
const MailRegister = require('../middleware/authRegisterMiddleware')

const login = (req, res) => {
  res.status(200).render('login&register/login', { message: null })
}

const loginPost = async (req, res) => {

  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).render('login&register/login', { message: 'Username and password are required' })
    }

    let user = await userModel.findByEmail(email)
    
    if (!user) {
      res.status(401).render('login&register/login', { message: 'Your email is not registered' })
      
    } else {
      const isValid = await bcrypt.compare(password, user.password)
      
      if (email === user.email && isValid === true) {
        if (user.isRegister === true) {
          
          if (user.role === 'admin') {
            res.status(400).render('login&register/login', { message: 'This account is admin role' })
          }

          const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, { expiresIn })

          res.cookie('token_user', token, { 
            httpOnly: true, 
            secure: true,
            maxAge: 86400000 
          })
 
          res.status(200).redirect('/')

        } else {
          res.status(401).render('login&register/login', { message: 'Your email has not been activated, please activate it first' })

        }
      } else {
        res.status(400).render('login&register/login', { message: 'Your email or password is incorrect' })

      }
    }

  } catch (error) {
    console.error('Error in loginPost:', error)
    res.status(500).render('error/error', err500)

  }
}

const register = (req, res) => {
  res.status(200).render('login&register/register', { message: null })
}

const registerPost = async (req, res) => {

  try {
    const { username, email, password } = req.body

    if (!username) {
      res.status(400).render('login&Register/register', { message: 'Username is required' })

    } else if (!email) {
      res.status(400).render('login&Register/register', { message: 'Email is required' })

    } else if (!password) {
      res.status(400).render('login&Register/register', { message: 'Password is required' })

    } else {

      let user = await userModel.findByEmail(email)

      const id = idCreator.createID()

      const isActive = false
      const hashPassword = await bcrypt.hash(password, 10)

      if (!user) {

        user = await userModel.create({
          id, username, email,
          name: null,
          role: 'user',
          password: hashPassword,
          isRegister: isActive
        })

        user = req.body

        const mailRegisterInstance = new MailRegister(user)
        await mailRegisterInstance.sendMail()

        res.status(201).render('login&Register/login', { message: 'User registered successfully, check your email for activation !' })

      } else {
        res.status(400).render('login&Register/register', { message: 'User registration failed, Email already exists' })
      }
    }
  } catch (error) {
    console.error('Error in postRegisterUser:', error);
    res.status(500).render('error/error', err500)
  }
}

const registerVerify = async (req, res) => {
  try {
    const email = req.query.email

    let user = await userModel.findByEmail(email)

    if (!user) {
      res.status(400).render('login&Register/register', { message: `Users with email ${email} are not registered` })

    } else {
      await userModel.verify(email, user.isRegister = true)
      res.status(201).render('login&Register/login', { message: 'Your email has been successfully verified' })

    }
  } catch (error) {
    console.error('Error in verify:', error)
    res.status(500).render('error/error', err500)
  }
}


const logout = (req, res) => {
  try {
    res.clearCookie('token_user')
    res.status(200).redirect('/user/login')

  } catch (error) {
    console.error('Error in logoutPost:', error)
    res.status(500).render('error/error', err500)

  }
}

module.exports = {
  login, loginPost, register, registerPost, registerVerify, logout
}