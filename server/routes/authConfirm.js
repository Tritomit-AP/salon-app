const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const AuthConfirm = require('../models/authConfirm.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

router.post('/', async (req, res) => {
    try {
        const { name, email, userId, authCode } = req.body
        if (!userId || !authCode) {
            return res.status(400).json({ success: false, error: "The authentication code and user details are required." })
        } else {
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
                        const token = jwt.sign({
                            name: name,
                            email: email
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
})

module.exports = router