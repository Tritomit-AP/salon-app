const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')

const regex = new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)

router.patch(
    '/:id', 
    body('newEmail').optional({ checkFalsy: true }).isEmail(),
    body('newPassword').optional({ checkFalsy: true }).matches(regex),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: "The email or password provided is invalid" })
        }

        try {
            const { newEmail, currentPassword, newPassword } = req.body
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