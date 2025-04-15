const knex = require('knex')
const knexConfig = require('../config/knexfile')

const db = knex(knexConfig.development)


const getAllJobs = async (page, limit, search) => {
  try {
    const offset = (page - 1) * limit

    const jobs = await db('jobs')
      .where(function () {
        if (search) {
          this.where(db.raw('LOWER(title)'), 'like', `%${search.toLowerCase()}%`)
            .orWhere(db.raw('LOWER(description)'), 'like', `%${search.toLowerCase()}%`)
            .orWhere(db.raw('LOWER(type)'), 'like', `%${search.toLowerCase()}%`)
        }
      })
      .andWhere({ isExpired: false })
      .orderBy('updated_at', 'desc')
      .limit(limit)
      .offset(offset)

    const [{ count }] = await db('jobs')
      .where(function () {
        if (search) {
          this.where(db.raw('LOWER(title)'), 'like', `%${search.toLowerCase()}%`)
            .orWhere(db.raw('LOWER(description)'), 'like', `%${search.toLowerCase()}%`)
            .orWhere(db.raw('LOWER(type)'), 'like', `%${search.toLowerCase()}%`)
        }
      })
      .andWhere({ isExpired: false })
      .count('jobs.id as count')

    return { jobs, totalItems: parseInt(count) }

  } catch (error) {
    throw new Error('Error getting all news jobs' + error.message)
  }
}

const getUserJobs = async (page, limit, search, user_id) => {
  try {
    const offset = (page - 1) * limit

    const jobs = await db('jobs')
      .join('applications', 'jobs.id', 'applications.job_id')
      .select('jobs.*')
      .where('applications.user_id', user_id)
      .where(function () {
        if (search) {
          this.whereRaw('LOWER(title) LIKE ?', [`%${search.toLowerCase()}%`])
            .orWhereRaw('LOWER(description) LIKE ?', [`%${search.toLowerCase()}%`])
            .orWhereRaw('LOWER(type) LIKE ?', [`%${search.toLowerCase()}%`])
        }
      })
      .andWhere({ isExpired: false })
      .groupBy('jobs.id', 'applications.updated_at')
      .orderBy('applications.updated_at', 'desc')
      .limit(limit)
      .offset(offset)

    const [{ count }] = await db('jobs')
      .join('applications', 'jobs.id', 'applications.job_id')
      .where('applications.user_id', user_id)
      .where(function () {
        if (search) {
          this.whereRaw('LOWER(title) LIKE ?', [`%${search.toLowerCase()}%`])
            .orWhereRaw('LOWER(description) LIKE ?', [`%${search.toLowerCase()}%`])
            .orWhereRaw('LOWER(type) LIKE ?', [`%${search.toLowerCase()}%`])
        }
      })
      .andWhere({ isExpired: false })
      .countDistinct('jobs.id as count')

    return {
      jobs,
      totalItems: parseInt(count)
    }

  } catch (error) {
    throw new Error('Error getting all user jobs: ' + error.message)
  }
}

const getOne = async (id) => {
  try {
    return await db('jobs').where({ id }).first()

  } catch (error) {
    throw new Error('Error geting a job vacancy by id')

  }
}

const createApplication = async (data) => {
  try {
    return await db('applications').insert(data)

  } catch (error) {
    throw new Error('Error failed create new application' + error.message)
  }
 }

module.exports = {
  getAllJobs, getUserJobs, getOne, createApplication
}