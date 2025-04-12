const knex = require('knex')
const knexConfig = require('../config/knexfile')

const db = knex(knexConfig.development)


const getOne = async (id) => {
  try {
    return await db('tags').where({ id }).first()

  } catch (error) {
    console.error(error.message)
    throw new Error('Error geting a tags by id')

  }
}

module.exports = {
  getOne
}