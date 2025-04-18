const { mailerVerification } = require('../config/mailConfig')
const ejs = require('ejs')
const path = require('path')

class MailRegister {

  constructor( user ){
    this.user = user
  }

  async sendMail(){
    const emailParam = encodeURIComponent(this.user.email)
    const templatePath = path.join(__dirname, '..', 'view', 'mail', 'registerMail.ejs');

    const renderedTemplate = await ejs.renderFile(templatePath, {
      user: this.user,
      verificationLink: `http://localhost:3000/user/register/verify?email=${emailParam}`,
    })

    mailerVerification(this.user.email, renderedTemplate)

  }

}

module.exports = MailRegister