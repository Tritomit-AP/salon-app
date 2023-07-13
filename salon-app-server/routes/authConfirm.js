const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const AuthConfirm = require('../models/authConfirm.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { body, validationResult } = require('express-validator')

router.post(
    '/',
    body(['name', 'email', 'userId', 'authCode']).not().isEmpty().withMessage("Some vital information is missing..."),
    body('email').isEmail().withMessage("Email is not valid."),
    body('authCode').isLength({ min: 6, max: 6 }).withMessage("Authentication code is not valid."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }
        
        const { name, email, userId, authCode } = req.body
        try {
            const authCodeRecord = await AuthConfirm.findOne({ userId })
            if (!authCodeRecord) {
                return res.status(404).json({ success: false, error: "This record does not exist. Please try again." })
            } else {
                const { authCode:hashedCode, expiresAt } = authCodeRecord
                if (expiresAt < Date.now()) {
                    await AuthConfirm.deleteMany({ userId })
                    return res.status(410).json({ success: false, error: "Your authentication code expired. Please login again and request a new one." })
                } else {
                    const validAuthCode = await bcrypt.compare(authCode, hashedCode)
                    if (!validAuthCode) {
                        return res.status(422).json({ success: false, error: "Your authentication code is wrong. Please check your inbox or login again and request a new code." })
                    } else {
                        const existingUser = await User.findById(userId)
                        if (existingUser.name !== name) {
                            return res.status(422).json({ success: false, error: "Some information is wrong. Try again." })
                        } else if (existingUser.email !== email) {
                            return res.status(422).json({ success: false, error: "Some information is wrong. Try again." })
                        } else {
                            const token = jwt.sign({
                                name: name,
                                email: email,
                                userId: userId
                            }, config.jwtSecret)
                            const user = await User.findOneAndUpdate(
                                { _id: userId },
                                { $set: { providedAuth: true }},
                                { new: true }
                            )
                            await AuthConfirm.deleteMany({ userId })
                            //final response including signed token
                            return res.json({ success: true, token: token, user: user.withoutPassword() })
                        }
                    }
                }
            }
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

module.exports = router