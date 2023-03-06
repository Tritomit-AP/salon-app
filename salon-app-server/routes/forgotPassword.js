const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const ResetToken = require('../models/resetToken.model')
const bcrypt = require('bcryptjs')
const config = require('../config')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator')

// contain min 8 chars, 1 small letter, 1 capital letter, 1 number, 1 special char
const regex = new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: config.authEmail,
      pass: config.authEmailPass
    }
})

router.post(
    '/request', 
    body('email').not().isEmpty().isEmail(),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: "Email provided is invalid" })
        }

        const { email } = req.body

        try {
            const user = await User.findOne({ email })
            
            if (!user) {
                return res.status(200).json({ success: true })
            }
            
            const token = await ResetToken.findOne({ userId: user._id })
            if (token) await token.deleteOne()
        
            const resetToken = crypto.randomBytes(32).toString("hex")
            const hashedResetToken = await bcrypt.hash(resetToken, 10)

            const newResetToken = await ResetToken.create({
                userId: user._id,
                token: hashedResetToken,
                createdAt: Date.now()
            })

            const resetLink = `${config.clientURL}/password-reset?token=${resetToken}&id=${user._id}`

            const mailOptions = {
                from: "support@client.com",
                to: email,
                subject: "Your password reset link",
                html: `
                    <h1>Hi ${user.name}</h1>
                    <p>You have requested a password reset link on Client</p>
                    <p>Please click on the link below and follow the instructions to reset your password.</p>
                    <a href=${resetLink}>Click here!</a>
                    <p>${resetLink}</p>
                    <p>If you haven't requested this, just ignore this email.</p>
                `
            }

            await transport.sendMail(mailOptions)

            res.status(200).json({ success: true })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

router.patch(
    '/reset', 
    body('password').not().isEmpty().matches(regex).withMessage("Password does not meet all requirements"),
    body(['userId', 'token']).not().isEmpty().withMessage("Some vital information is missing..."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array().map(error => error.msg) });
        }

        const { password, userId, token } = req.body

        try {
            const resetToken = await ResetToken.findOne({ userId })
            
            if (!resetToken) {
                return res.status(404).json({ success: false, error: "Token has expired or it's invalid" })
            }

            const isValidResetToken = await bcrypt.compare(token, resetToken.token)

            if (!isValidResetToken) {
                return res.status(498).json({ success: false, error: "Token has expired or it's invalid" })
            }

            const hashedUpdatedPassword = await bcrypt.hash(password, 10)

            const user = await User.findById(userId)
            user.password = hashedUpdatedPassword
            const updatedUser = await user.save()

            const mailOptions = {
                from: "support@client.com",
                to: updatedUser.email,
                subject: "Your password has been reset",
                html: `
                    <h1>Hi ${updatedUser.name}</h1>
                    <p>You have successfully changed your password.</p>
                    <p>If you haven't done this, please contact us immediately.</p>
                `
            }

            await transport.sendMail(mailOptions)

            await resetToken.deleteOne()

            res.status(201).json({ success: true, message: "Your password has been reset" })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

module.exports = router