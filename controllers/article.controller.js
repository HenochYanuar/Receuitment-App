const { decode } = require('html-entities')
const articleModel = require('../models/article.model')
const tagsModel = require('../models/tags.model')
const userModel = require('../models/user.model')
const commentModel = require('../models/comment.model')
const moment = require('moment')
const { err500, err404, err403 } = require('../utils/error')
const idCreator = require('../utils/idCreator')

const layout = 'layout/index'


const getAllArticles = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)
    
    if (!user) {
      return res.status(404).render('error/error', err404)
    }

    const query = req.query.query

    const articles = query ? await articleModel.getAllArticlesByQuery(query) : await articleModel.getAllArticles()

    articles.forEach(article => {
      article.content = decode(article.content.replace(/<\/?[^>]+(>|$)/g, ""))
    })

    const articlesWithTimeDiff = articles.map(article => {
      const updatedAt = moment(article.updated_at)
      const now = moment()

      const diffInHours = now.diff(updatedAt, 'hours')
      const diffInDays = now.diff(updatedAt, 'days')
      const diffInWeeks = now.diff(updatedAt, 'weeks')
      const diffInMonth = now.diff(updatedAt, 'months')
      const diffInYears = now.diff(updatedAt, 'years')

      let timeDifferenceText

      if (diffInYears >= 1) {
        timeDifferenceText = `${diffInYears} tahun yang lalu`
      }if (diffInMonth >= 1) {
        timeDifferenceText = `${diffInMonth} bulan yang lalu`
      } else if (diffInWeeks >= 1) {
        timeDifferenceText = `${diffInWeeks} minggu yang lalu`
      } else if (diffInDays >= 1) {
        timeDifferenceText = `${diffInDays} hari yang lalu`
      } else if (diffInHours >= 1) {
        timeDifferenceText = `${diffInHours} jam yang lalu`
      } else {
        const diffInMinutes = now.diff(updatedAt, 'minutes')
        timeDifferenceText = `${diffInMinutes} menityang lalu`
      }

      return {
        ...article,
        timeDifference: timeDifferenceText
      }
    })

    const context = {
      articles: articlesWithTimeDiff,
      user
    }

    const title = 'Articles Dashboard'

    res.status(200).render('dashboard/index', { context, title, layout })
  } catch (error) {
    console.error('Error in getAllArticles:', error)
    res.status(500).render('error/error', err500)
  }
}

const getDetailArticle = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email)
    const article = await articleModel.getOne(req.params.id)
    let tags = await tagsModel.getOne(req.params.id)
    const comments = await commentModel.getOne(req.params.id)

    if (!article || !user) {
      res.status(404).render('error/error', err404)
      return
    }

    const calculateTimeDifference = (timestamp) => {
      const updatedAt = moment(timestamp)
      const now = moment()

      const diffInHours = now.diff(updatedAt, 'hours')
      const diffInDays = now.diff(updatedAt, 'days')
      const diffInWeeks = now.diff(updatedAt, 'weeks')
      const diffInMonths = now.diff(updatedAt, 'months')
      const diffInYears = now.diff(updatedAt, 'years')

      if (diffInYears >= 1) {
        return `${diffInYears} tahun yang lalu`
      } else if (diffInMonths >= 1) {
        return `${diffInMonths} bulan yang lalu`
      } else if (diffInWeeks >= 1) {
        return `${diffInWeeks} minggu yang lalu`
      } else if (diffInDays >= 1) {
        return `${diffInDays} hari yang lalu`
      } else if (diffInHours >= 1) {
        return `${diffInHours} jam yang lalu`
      } else {
        const diffInMinutes = now.diff(updatedAt, 'minutes')
        return `${diffInMinutes} menit yang lalu`
      }
    }

    // Mengatur komentar dalam bentuk hierarki
    const nestComments = (comments) => {
      const commentMap = {}
      
      // Buat peta komentar dengan timeDifference
      comments.forEach(comment => {
        commentMap[comment.id] = { 
          ...comment, 
          children: [], 
          timeDifference: calculateTimeDifference(comment.updated_at) // Tambahkan timeDifference
        }
      })

      const nestedComments = []
      
      comments.forEach(comment => {
        if (comment.parent_id) {
          // Jika komentar memiliki parent_id, tambahkan ke dalam array children
          if (commentMap[comment.parent_id]) {
            commentMap[comment.parent_id].children.push(commentMap[comment.id])
          }
        } else {
          // Jika tidak memiliki parent_id, masukkan ke array root
          nestedComments.push(commentMap[comment.id])
        }
      })

      return nestedComments
    }

    const nestedComments = nestComments(comments)
    
    tags = tags.tag
    
    const tagsArray = tags
      .replace(/[{}]/g, '') 
      .split(',')
      .map(item => item.trim().replace(/['" ]/g, ""))

    const context = {
      user, 
      article,
      comments: nestedComments,
      tag: tagsArray
    }

    const title = 'Detail News Articel'

    return res.status(200).render('dashboard/detail', { context, title, layout })

  } catch (error) {
    console.error('Error in getDetailArticle:', error)
    res.status(500).render('error/error', err500)
  }
}

const postComment = async (req, res) => {
  try {
    const { article_id, user_id, comment, parent_id } = await req.body

    if (!article_id || !user_id || !comment) {
      res.status(403).render('error/error', err403)
      return
    }

    const id = idCreator.createID()

    if (!parent_id) {
      await commentModel.create({
        id, article_id, user_id,
        content: comment
      })
      res.status(201).redirect(`/${article_id}#comments-section`)
    }

    await commentModel.create({
      id, article_id, user_id, parent_id,
      content: comment
    })

    res.status(201).redirect(`/${article_id}#comments-section`)
    
  } catch (error) {
    console.error('Error in postComment:', error.message)
    res.status(500).render('error/error', err500)
  }
}


module.exports = {
  getAllArticles, getDetailArticle, postComment
}