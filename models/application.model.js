const knex = require('knex')
const knexConfig = require('../config/knexfile')

const environment = process.env.NODE_ENV || 'development'
const db = knex(knexConfig[environment])

const findByUserAndJob = async (userId, jobId) => {
  try {
    const row = await db('applications')
      .where('user_id', userId)
      .andWhere('job_id', jobId)
      .select('*')

    return row
    
  } catch (error) {
    throw new Error('Error finding application by user and job' + error.message)
    
  }
}

const getUserApplications = async (userId) => {
  try {
    const rows = await db('applications')
      .where('user_id', userId)
      .select('*')

    return rows
    
  } catch (error) {
    throw new Error('Error finding application by user and job' + error.message)
    
  }
}

module.exports = {
  findByUserAndJob, getUserApplications
}