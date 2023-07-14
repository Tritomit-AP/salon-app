const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const AuthConfirm = require('../models/authConfirm.model')
const EmailToken = require('../models/emailToken.model')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const config = require('../config')
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator')
const { checkUser } = require('../middlewares/checkUser')
const { sendAuthCodeEmail } = require('../utilities/sendAuthCodeEmail')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: config.authEmail,
        pass: config.authEmailPass
    }
})

router.post('/request',
    checkUser,
    body('newAdminEmail')
        .not().isEmpty().withMessage("New admin email is required.")
        .isEmail().withMessage("Email provided is invalid."),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }

        const { newAdminEmail } = req.body
        const { userId } = req.query
    
        try {
            let user = await User.findById(userId)
            const existingEmail = await User.findOne({ email: newAdminEmail })

            if (!user) {
                return res.status(404).json({ success: false, error: 'Cannot find user.' })
            } else if (newAdminEmail === user.email) {
                return res.status(409).json({ success: false, error: 'This is your current email address.' })
            } else if (existingEmail) {
                return res.status(409).json({ success: false, error: 'This email address has already been taken.' })
            } else {
                await sendAuthCodeEmail(user, res)
            }
            res.status(200).json({ success: true, message: "Authentication code sent on email." })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

router.post('/confirm',
    checkUser,
    body(['newAdminEmail', 'authCode']).not().isEmpty().withMessage("Some vital information is missing..."),
    body('authCode').isLength({ min: 6, max: 6 }).withMessage("Authentication code is not valid."),
    body('newAdminEmail').isEmail().withMessage("Email provided is invalid."),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }

        const { newAdminEmail, authCode } = req.body
        const { userId } = req.query
    
        try {
            let user = await User.findById(userId)
            const authCodeRecord = await AuthConfirm.findOne({ userId })
            if (!authCodeRecord) {
                return res.status(404).json({ success: false, error: "This record does not exist. Please try again." })
            } else {
                const { authCode:hashedCode, expiresAt } = authCodeRecord
                if (expiresAt < Date.now()) {
                    await AuthConfirm.deleteMany({ userId })
                    return res.status(410).json({ success: false, error: "Your authentication code expired. Please ask for a new one." })
                } else {
                    const validAuthCode = await bcrypt.compare(authCode, hashedCode)
                    if (!validAuthCode) {
                        return res.status(422).json({ success: false, error: "Your authentication code is wrong. Please check your inbox or ask for a new code." })
                    } else {
                        const existingEmail = await EmailToken.findOne({ newEmail: newAdminEmail })
                        if (existingEmail) {
                            return res.status(409).json({ success: false, error: "This email has already been invited." })
                        } else {
                            const token = await EmailToken.findOne({ userId: user._id, action: "adminInviteEmail" })
                            if (token) await token.deleteOne()
                    
                            const emailToken = crypto.randomBytes(32).toString("hex")
                            const hashedEmailToken = await bcrypt.hash(emailToken, 10)
    
                            const newEmailToken = await EmailToken.create({
                                userId: user._id,
                                token: hashedEmailToken,
                                newEmail: newAdminEmail,
                                action: "adminInviteEmail",
                                createdAt: Date.now()
                            })
    
                            const verificationLink = `${config.clientURL}/create-admin-account?token=${emailToken}&id=${user._id}`
    
                            const mailOptions = {
                                from: "support@client.com",
                                to: newAdminEmail,
                                subject: "Your invitation to Salon app",
                                html: `
                                    <h1>Hi ${newAdminEmail}</h1>
                                    <p>You have been invited by ${user.name} as an admin of Salon app.</p>
                                    <p>In order to start using your account, please click on the link below to finish your registration.</p>
                                    <a href=${verificationLink}>Click here!</a>
                                    <p>${verificationLink}</p>
                                    <p>If you haven't requested this, please contact ${user.name} from Salon app directly.</p>
                                `
                            }
    
                            await transport.sendMail(mailOptions)
                            await AuthConfirm.deleteMany({ userId })
                        }
                    }
                }
            }

            res.status(200).json({ success: true, message: "New admin invited. Inform them to check their email and follow the instructions." })
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

module.exports = router