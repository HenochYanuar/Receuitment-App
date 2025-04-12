const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  port: 587,
  secure: false
})

const mailerVerification = async (toEmail, template) => {
  const mailerConfig = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: 'Account Verification',
    html: template
  }

  try {
    const info = await transporter.sendMail(mailerConfig)
    console.log('Email sent: ' + info.response)
  } catch (error) {
    console.error(error);
  }
};

module.exports = { mailerVerification }