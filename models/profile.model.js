const knex = require('knex')
const knexConfig = require('../config/knexfile')

const db = knex(knexConfig.development)

exports.updatedUser = async (id, username, name) => {
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