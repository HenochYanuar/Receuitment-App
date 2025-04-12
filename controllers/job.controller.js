const { decode } = require('html-entities')
const jobModel = require('../models/job.model')
const tagsModel = require('../models/tags.model')
const userModel = require('../models/user.model')
const commentModel = require('../models/comment.model')
const moment = require('moment')
const { err500, err404, err403 } = require('../utils/error')
const idCreator = require('../utils/idCreator')
const formatCurrency = require('../utils/formatCurrency')

const layout = 'layout/index'


const getAllJobs = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)

    if (!user) {
      return res.status(404).render('error/error', err404)
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 9
    const search = req.query.search || ''

    const { jobs, totalItems } = await jobModel.getAllJobs(page, limit, search)
    const totalPages = Math.ceil(totalItems / limit)

    const jobsFormatted = jobs.map(job => {
      const cleanedDesc = decode(job.description.replace(/<\/?[^>]+(>|$)/g, ''))

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
        timeDifference: timeText
      }
    })

    const context = {
      user,
      jobs: jobsFormatted,
      currentPage: page,
      totalPages,
      totalItems,
      limit,
      search
    }

    const title = 'Dashboard | Job Vacancies'

    res.status(200).render('dashboard/index', {
      context,
      title,
      layout,
      formatCurrency
    })

  } catch (error) {
    console.error('Error in getAllJobs:', error)
    res.status(500).render('error/error', err500)
  }
}

const getDetailJob = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)
    
    if (!user) {
      return res.status(404).render('error/error', err404)
    }
    
    const job = await jobModel.getOne(req.params.id)
    
    if (!job) {
      return res.status(404).render('error/error', err404)
    }
    
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
    
    const context = {
      user,
      job: {
        ...job,
        timeDifference: timeText
      }
    }
    
    const title = 'Detail Job Vacancy'

    res.status(200).render('dashboard/detail', {
      context,
      title,
      layout,
      formatCurrency
    })

  } catch (error) {
    console.error('Error in getDetailJob:', error)
    res.status(500).render('error/error', err500)
  }
}

const postComment = async (req, res) => {
  try {
    const { article_id, user_id, comment, parent_id } = await req.body

    if (!article_id || !user_id || !comment) {
      res.status(403).render('error/error', err403)
      return
    }

    const id = idCreator.createID()

    if (!parent_id) {
      await commentModel.create({
        id, article_id, user_id,
        content: comment
      })
      res.status(201).redirect(`/${article_id}#comments-section`)
    }

    await commentModel.create({
      id, article_id, user_id, parent_id,
      content: comment
    })

    res.status(201).redirect(`/${article_id}#comments-section`)
    
  } catch (error) {
    console.error('Error in postComment:', error.message)
    res.status(500).render('error/error', err500)
  }
}


module.exports = {
  getAllJobs, getDetailJob, postComment
}