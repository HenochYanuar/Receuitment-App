const knex = require('knex')
const knexConfig = require('../config/knexfile')

const db = knex(knexConfig.development)


const getOne = async (id) => {
  try {
    return await db('resumes').where({ id }).first()

  } catch (error) {
    console.error(error.message)
    throw new Error('Error geting a resume by id')

  }
}

module.exports = {
  getOne
}