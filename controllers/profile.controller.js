const userModel = require('../models/user.model')
const commentModel = require('../models/comment.model')
const profileModel = require('../models/profile.model')
const { err500, err404 } = require('../utils/error')
const layout = 'layout/index'

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)
    const comments = await commentModel.getUserComments(user.id)

    if (!user) {
      return res.status(404).render('error/error', err404)
    }

    context = {
      user, comments
    }

    const title = 'User Profile'

    return res.status(200).render('profile/index', { context, title, layout })

  } catch (error) {
    console.error('Error in get user profile:', error.message)
    res.status(500).render('error/error', err500)
  }
}

const formUpdateProfile = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)

    if (!user) {
      return res.status(404).render('error/error', err404)
    }

    context = {
      user
    }

    const title = 'Update Profile'

    return res.status(200).render('profile/formUpdate', { context, title, layout })

  } catch (error) {
    console.error('Error in get form update profile:', error.message)
    res.status(500).render('error/error', err500)
  }
}

const postUpdateUserProfile = async (req, res) => {
  try {
    const { id, username, name, email } = req.body
    const user = await userModel.findByEmail(email || req.user.email)

    if (!user) {
      return res.status(404).render('error/error', err404)
    }

    if( !username ) {
      return res.status(400).redirect(`/user/profile/update/${id}`)
    }

    await profileModel.updatedUser(id, username, name)

    res.status(201).redirect(`/user/profile/${id}`)

  } catch (error) {
    console.error('Error updating user profile:', error.message)
    res.status(500).render('error/error', err500)
  }
}

module.exports = {
  getUserProfile, formUpdateProfile, postUpdateUserProfile
}