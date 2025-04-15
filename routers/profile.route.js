const express = require('express')
const authenticateJWT = require('../middleware/authMiddleware')
const { uploadUserResume } = require('../middleware/saveFileMiddleware')
const profileController = require('../controllers/profile.controller')

const profileRouter = express.Router()

profileRouter.use(authenticateJWT)

profileRouter.get('/profile/:id', profileController.getUserProfile)
profileRouter.get('/profile/update/:id', profileController.formUpdateProfile)
profileRouter.post('/profile/update', profileController.postUpdateUserProfile)
profileRouter.post('/profile/resume', profileController.uploadMiddleware, profileController.postUpdateUserResume)

module.exports = {
  profileRouter
}