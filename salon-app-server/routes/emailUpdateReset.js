const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const EmailToken = require('../models/emailToken.model')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const config = require('../config')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: config.authEmail,
        pass: config.authEmailPass
    }
})

router.patch('/',
    body(['userId', 'token']).not().isEmpty().withMessage("Some vital information is missing..."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array().map(error => error.msg) });
        }

        const { userId, token } = req.body

        try {
            const emailToken = await EmailToken.findOne({ userId })
            
            if (!emailToken) {
                return res.status(404).json({ success: false, error: "Token has expired or it's invalid" })
            }

            const isValidEmailToken = await bcrypt.compare(token, emailToken.token)

            if (!isValidEmailToken) {
                return res.status(498).json({ success: false, error: "Token has expired or it's invalid" })
            }

            const newEmail = emailToken.newEmail

            const user = await User.findById(userId)
            user.email = newEmail
            const updatedUser = await user.save()

            const mailOptions = {
                from: "support@client.com",
                to: updatedUser.email,
                subject: "Your email has been updated",
                html: `
                    <h1>Hi ${updatedUser.name}</h1>
                    <p>You have successfully changed your email.</p>
                `
            }

            await transport.sendMail(mailOptions)

            await emailToken.deleteOne()

            res.status(200).json({ success: true, message: "Your email has been updated" })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

module.exports = router