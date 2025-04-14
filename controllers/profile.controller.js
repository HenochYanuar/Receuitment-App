const { decode } = require('html-entities')
const moment = require('moment')
const userModel = require('../models/user.model')
const profileModel = require('../models/profile.model')
const resumeModel = require('../models/resume.model')
const jobModel = require('../models/job.model')
const applicationModel = require('../models/application.model')
const formatCurrency = require('../utils/formatCurrency')
const { err500, err404 } = require('../utils/error')
const layout = 'layout/index'

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)
    const profile = await profileModel.getUserProfile(user.id)
    const resume = await resumeModel.getOne(user.id)

    if (!user ) {
      return res.status(404).render('error/error', err404)
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 6
    const search = req.query.search || ''

    const { jobs, totalItems } = await jobModel.getUserJobs(page, limit, search, user.id)
    const totalPages = Math.ceil(totalItems / limit)

    const applications = await applicationModel.getUserApplications(user.id)
    
    const jobsFormatted = jobs.map((job, index) => {
      const cleanedDesc = decode(job.description.replace(/<\/?[^>]+(>|$)/g, ''))

      const status = applications[index].status

      const updatedAt = moment(job.updated_at)
      const now = moment()

      let timeText = ''
      const diffInYears = now.diff(updatedAt, 'years')
      const diffInMonths = now.diff(updatedAt, 'months')
      const diffInWeeks = now.diff(updatedAt, 'weeks')
      const diffInDays = now.diff(updatedAt, 'days')
      const diffInHours = now.diff(updatedAt, 'hours')
      const diffInMinutes = now.diff(updatedAt, 'minutes')

      if (diffInYears >= 1) timeText = `${diffInYears} tahun yang lalu`
      else if (diffInMonths >= 1) timeText = `${diffInMonths} bulan yang lalu`
      else if (diffInWeeks >= 1) timeText = `${diffInWeeks} minggu yang lalu`
      else if (diffInDays >= 1) timeText = `${diffInDays} hari yang lalu`
      else if (diffInHours >= 1) timeText = `${diffInHours} jam yang lalu`
      else if (diffInMinutes >= 1) timeText = `${diffInMinutes} menit yang lalu`
      else timeText = 'Baru saja'

      return {
        ...job,
        description: cleanedDesc,
        timeDifference: timeText,
        status
      }
    })

    context = {
      user, 
      profile, 
      resume,
      jobs: jobsFormatted,
      currentPage: page,
      totalPages,
      totalItems,
      limit,
      search,
    }

    const title = 'User Profile'

    return res.status(200).render('profile/index', { context, title, layout , formatCurrency })

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