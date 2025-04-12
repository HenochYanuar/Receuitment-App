const express = require('express')
const authenticateJWT = require('../middleware/authMiddleware')
const articleController = require('../controllers/article.controller')

const articleRouter = express.Router()

articleRouter.use(authenticateJWT)

articleRouter.get('/', articleController.getAllArticles)
articleRouter.get('/:id', articleController.getDetailArticle)
articleRouter.post('/', articleController.postComment)

module.exports = {
  articleRouter
}