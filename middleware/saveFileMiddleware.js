const multer = require('multer')
const path = require('path')

const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/user_resumes/files')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + 'Resume' + '-' + Date.now() + path.extname(file.originalname))
  }
})

const userResume = multer({ storage : resumeStorage })

module.exports = { 
  uploadUserResume: userResume.single('resume')
 }