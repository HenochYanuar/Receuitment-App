const knex = require('knex')
const knexConfig = require('../config/knexfile')

const db = knex(knexConfig.development)

const getUserProfile = async (id) => {
  try {
    return await db('user_details')
      .where('user_id', id)
      .first()

  } catch (error) {
    throw new Error('Error finding user by id' + error.message)

  }
}

const updatedUser = async (id, username, name) => {
  try {
    return await db('users')
      .where('id', id)
      .update({
        username,
        name
      })

  } catch (error) {
    throw new Error('Error failed posts the update profile' + error.message)

  }
}

module.exports = {
  getUserProfile, updatedUser
}