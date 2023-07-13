const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const { sendAuthCodeEmail } = require('../utilities/sendAuthCodeEmail')

router.post('/register', async (req, res) => {
    const newPassword = await bcrypt.hash(req.body.credentials.password, 10)
    try {
        const newUser = await User.create({
            name: req.body.credentials.name,
            email: req.body.credentials.email,
            password: newPassword
        })
        res.status(201).json({ success: true, user: newUser.withoutPassword() })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}) 

router.post(
    '/login', 
    body('credentials.email').not().isEmpty().isEmail(),
    body('credentials.password').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: "Email or password are incorrect" })
        }

        try {
            const user = await User.findOneAndUpdate(
                { email: req.body.credentials.email },
                { $set: { providedAuth: false }},
                { new: true }
            )
    
            if (!user) {
                return res.status(401).json({ success: false, error: "Email or password are incorrect" })
            }
    
            const isPasswordValid = await bcrypt.compare(req.body.credentials.password, user.password)

            if (isPasswordValid) {
                try { 
                    await sendAuthCodeEmail(user, res)
                } catch (error) {
                    return res.status(400).json({ success: false, error: error.message })
                }
                return res.json({ success: true, user: user.withoutPassword() })
            } else {
                return res.status(401).json({ success: false, error: "Email or password are incorrect" })
            }
            
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

module.exports = router