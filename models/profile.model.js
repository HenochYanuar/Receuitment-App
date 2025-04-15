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

const createProfile = async (data) => {
  try {
    return await db('user_details').insert(data)

  } catch (error) {
    throw new Error('Error failed create new user profile' + error.message)

  }
}

const updateProfile = async (id, name, phone, address) => {
  try {
    return await db('user_details')
      .where('id', id)
      .update({
        name, phone, address
      })

  } catch (error) {
    throw new Error('Error failed posts the update profile' + error.message)

  }
}

module.exports = {
  getUserProfile, createProfile, updateProfile
}