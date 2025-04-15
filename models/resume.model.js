const knex = require('knex')
const knexConfig = require('../config/knexfile')

const db = knex(knexConfig.development)


const getOne = async (id) => {
  try {
    return await db('resumes').where({ user_id: id }).first()

  } catch (error) {
    console.error(error.message)
    throw new Error('Error geting a resume by id')

  }
}

const createResume = async (data) => {
  try {
    return await db('resumes').insert(data)

  } catch (error) {
    throw new Error('Error failed create new user profile' + error.message)

  }
}

const updateResume = async (id, file_url) => {
  try {
    return await db('resumes')
      .where('id', id)
      .update({
        file_url
      })

  } catch (error) {
    throw new Error('Error failed posts the update profile' + error.message)

  }
}


module.exports = {
  getOne, createResume, updateResume
}