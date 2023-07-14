const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const EmailToken = require('../models/emailToken.model')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const config = require('../config')
const { checkUser } = require('../middlewares/checkUser')


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

router.patch('/name',
    checkUser,
    body('name').not().isEmpty().trim().escape(),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: "New name is required" })
        }

        const { name } = req.body
        const { userId } = req.query

        try {
            let user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({ success: false, error: 'Cannot find user' })
            } else {
                user.name = name
            }

            const updatedUser = await user.save()
            res.status(200).json({ success: true, user: updatedUser.withoutPassword() })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

router.post('/email-update-request',
    checkUser,
    body('newEmail')
        .not().isEmpty().withMessage("New email is required")
        .isEmail().withMessage("Email provided is invalid"),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }

        const { newEmail } = req.body
        const { userId } = req.query
    
        try {
            let user = await User.findById(userId)
            const existingEmail = await User.findOne({ email: newEmail })

            if (!user) {
                return res.status(404).json({ success: false, error: 'Cannot find user' })
            } else if (newEmail === user.email) {
                return res.status(409).json({ success: false, error: 'This is your current email address' })
            } else if (existingEmail) {
                return res.status(409).json({ success: false, error: 'This email address has already been taken' })
            } else {
                const token = await EmailToken.findOne({ userId: user._id, action: "userUpdateEmail" })
                if (token) await token.deleteOne()
        
                const emailToken = crypto.randomBytes(32).toString("hex")
                const hashedEmailToken = await bcrypt.hash(emailToken, 10)

                const newEmailToken = await EmailToken.create({
                    userId: user._id,
                    token: hashedEmailToken,
                    newEmail: newEmail,
                    action: "userUpdateEmail",
                    createdAt: Date.now()
                })

                const verificationLink = `${config.clientURL}/verify-email?token=${emailToken}&id=${user._id}`

                const mailOptions = {
                    from: "support@client.com",
                    to: newEmail,
                    subject: "Your email verification link",
                    html: `
                        <h1>Hi ${user.name}</h1>
                        <p>You have updated your email address on Client.</p>
                        <p>In order to start using it, please click on the link below to verify your new email address.</p>
                        <a href=${verificationLink}>Click here!</a>
                        <p>${verificationLink}</p>
                        <p>If you haven't done this, please contact us immediately.</p>
                    `
                }

                await transport.sendMail(mailOptions)

            }

            res.status(200).json({ success: true })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

router.patch('/password',
    checkUser,
    body('currentPassword').not().isEmpty().withMessage('For setting a new password, the current password is required'),
    body('newPassword')
        .not().isEmpty().withMessage('For setting a new password, the new password is required')
        .matches(regex).withMessage("Password does not meet all requirements"),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }

        const { currentPassword, newPassword } = req.body
        const { userId } = req.query

        try {
            let user = await User.findById(userId)
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
            const hashedUpdatedPassword  = await bcrypt.hash(newPassword, 10)

            if (!isPasswordValid) {
                return res.status(401).json({ success: false, error: "Your current password is incorrect" })
            } else {
                user.password = hashedUpdatedPassword
            }

            const updatedUser = await user.save()

            const mailOptions = {
                from: "support@client.com",
                to: updatedUser.email,
                subject: "Your password has been changed",
                html: `
                    <h1>Hi ${updatedUser.name}</h1>
                    <p>You have successfully changed your password.</p>
                    <p>If you haven't done this, please contact us immediately.</p>
                `
            }

            await transport.sendMail(mailOptions)

            res.status(200).json({ success: true, user: updatedUser.withoutPassword() })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

module.exports = router