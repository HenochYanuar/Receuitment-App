const { decode } = require('html-entities')
const moment = require('moment')
const userModel = require('../models/user.model')
const profileModel = require('../models/profile.model')
const resumeModel = require('../models/resume.model')
const jobModel = require('../models/job.model')
const applicationModel = require('../models/application.model')
const formatCurrency = require('../utils/formatCurrency')
const saveFileMiddleware = require('../middleware/saveFileMiddleware')
const idCreator = require('../utils/idCreator')
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
    
    const jobsFormatted = jobs.map((job) => {
      const cleanedDesc = decode(job.description.replace(/<\/?[^>]+(>|$)/g, ''))
    
      const relatedApp = applications.find(app => app.job_id === job.id)
    
      const updatedAt = relatedApp ? moment(relatedApp.updated_at) : moment(job.updated_at)
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
        applicationStatus: relatedApp ? relatedApp.status : null,
        sortTime: updatedAt
      }
    })

    const context = {
      user, 
      profile, 
      resume,
      jobs: jobsFormatted.sort((a, b) => moment(b.sortTime).valueOf() - moment(a.sortTime).valueOf()),
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
    const profile = await profileModel.getUserProfile(user.id)

    if (!user) {
      return res.status(404).render('error/error', err404)
    }

    context = {
      user, profile
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
    const { id, username, name, email, phone, address } = req.body
    const user = await userModel.findByEmail(req.user.email || email)

    if (!user) {
      return res.status(404).render('error/error', err404)
    }

    await userModel.updatedUser(id, username)

    const profile = await profileModel.getUserProfile(user.id)

    if (!profile) {
      const profile_id = idCreator.createID()

      await profileModel.createProfile({
        id: profile_id, user_id:id, name, phone, address
      })
    } else {
      const id = profile.id
      await profileModel.updateProfile(id, name, phone, address)
    }

    res.status(201).redirect(`/user/profile/update/${id}`)

  } catch (error) {
    console.error('Error updating user profile:', error.message)
    res.status(500).render('error/error', err500)
  }
}

const postUpdateUserResume = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)

    if (!req.file) {
      return res.status(404).render('error/error', err404).send('File not uploaded')
    }

    const resume = await resumeModel.getOne(user.id)

    if(!resume) {
      const id = idCreator.createID()
    
      await resumeModel.createResume({
        id,
        user_id: user.id,
        file_url: `https://receuitment-app.vercel.app/assets/user_resumes/files/${req.file.filename}`
      })
    } else {
      const file_url = `https://receuitment-app.vercel.app/assets/user_resumes/files/${req.file.filename}`
      await resumeModel.updateResume(
        resume.id, 
        file_url
      )
    }

    

    res.status(201).redirect(`/user/profile/${user.id}`)

  } catch (error) {
    console.error('Error updating user resume:', error.message)
    res.status(500).render('error/error', err500)
  }
}


const uploadMiddleware = saveFileMiddleware.uploadUserResume

module.exports = {
  getUserProfile, formUpdateProfile, postUpdateUserProfile, postUpdateUserResume, uploadMiddleware
}