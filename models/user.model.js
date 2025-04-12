const knex = require('knex')
const knexConfig = require('../config/knexfile')

const db = knex(knexConfig.development)

const findByEmail = async (email) => {
  try {
    return await db('users').where({ email }).first()

  } catch (error) {
    throw new Error('Error finding user by email')

  }
}

const create = async (data) => {
  try {
    return await db('users').insert(data)

  } catch (error) {
    throw new Error('Error failed create new user' + error.message)

  }
}

const verify = async (email, isRegister) => {
  try {
      return await db('users').where({ email }).update({ isRegister })
  } catch (error) {
      throw new Error('Error updateing user by email' + error.message)
  }
}

module.exports = {
  findByEmail, create, verify
}