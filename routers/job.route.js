const express = require('express')
const authenticateJWT = require('../middleware/authMiddleware')
const jobController = require('../controllers/job.controller')

const jobRouter = express.Router()

jobRouter.use(authenticateJWT)

jobRouter.get('/', jobController.getAllJobs)
jobRouter.get('/:id', jobController.getDetailJob)
// jobRouter.post('/', jobController.postComment)

module.exports = {
  jobRouter
}