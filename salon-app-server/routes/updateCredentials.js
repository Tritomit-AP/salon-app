const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const config = require('../config')


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

const checkUser = (req, res, next) => {

    const userId = req.auth.userId
    const ownerId = req.query.userId

    try {
        const user = User.findById(ownerId)
        if (!user) {
            return res.status(404).json({ success: false, error: "Cannot find user" })
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }

    if (userId !== ownerId) {
        return res.status(401).json({ success: false, error: "You don't have permission to do this" })
    }

    next()
}

router.patch(
    '/name',
    checkUser,
    body('name').not().isEmpty().trim().escape(),
    async (req, res) => {
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

router.patch(
    '/email',
    checkUser,
    body('newEmail').not().isEmpty().isEmail().normalizeEmail(),
    async (req, res) => {
        
    }
)




body('email').isEmail().normalizeEmail(),
    router.patch(
        '/:id',
        body('newEmail').optional({ checkFalsy: true }).isEmail(),
        body('newPassword').optional({ checkFalsy: true }).matches(regex),
        async (req, res) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, error: "Email or password provided is invalid" })
            }

            const { newEmail, currentPassword, newPassword } = req.body

            try {
                let user = await User.findById(req.params.id)
                const existingEmail = await User.find({ email: newEmail })
                const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
                const updatedPassword = await bcrypt.hash(newPassword, 10)

                // Update email
                if (!user) {
                    return res.status(404).json({ success: false, error: 'Cannot find user' })
                } else if (newEmail === user.email) {
                    return res.status(409).json({ success: false, error: 'This is your current email address' })
                } else if (existingEmail.length > 0) {
                    return res.status(409).json({ success: false, error: 'This email address has already been taken' })
                } else if (newEmail) {
                    user.email = newEmail
                }

                //Update password
                if (newPassword && !currentPassword) {
                    return res.status(400).json({ success: false, error: "For setting a new password, the current password is required" })
                } else if (!newPassword && currentPassword) {
                    return res.status(400).json({ success: false, error: "You need to set the new password" })
                } else if (currentPassword && !isPasswordValid) {
                    return res.status(401).json({ success: false, error: "Your current password is incorrect" })
                } else if (newPassword && currentPassword && isPasswordValid) {
                    user.password = updatedPassword
                }

                if (!newEmail && !currentPassword && !newPassword) {
                    return res.status(204).json({ message: "No content" })
                }

                const updatedUser = await user.save()
                res.status(200).json({ success: true, user: updatedUser })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
        }
    )

module.exports = router