const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const AuthConfirm = require('../models/authConfirm.model')
const bcrypt = require('bcryptjs')
const config = require('../config')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: config.authEmail,
      pass: config.authEmailPass
    }
})

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

router.post('/login', async (req, res) => {
    const user = await User.findOneAndUpdate(
        { email: req.body.credentials.email },
        { $set: { providedAuth: false }},
        { new: true }
    )

    if (!user) {
        return res.status(401).json({ success: false, error: 'Email or password are incorrect' })
    }

    const isPasswordValid = await bcrypt.compare(req.body.credentials.password, user.password)
    
    if (isPasswordValid) {
        try { 
            await sendAuthCodeEmail(user, res)
        } catch (error) {
            return res.status(400).json({ success: false, error: error.message })
        }
        //intial response
        return res.json({ success: true, user: user.withoutPassword() })
    } else {
        return res.status(401).json({ success: false, error: "Email or password are incorrect" })
    }
})

const sendAuthCodeEmail = async ({ _id, email }, res) => {
    try {
        const authCode = crypto.randomBytes(3).toString("hex").toUpperCase()
        const mailOptions = {
            from: config.authEmail,
            to: email,
            subject: "Your authentication code",
            html: `
                <p>This is your authentication code requested from VSNRY Admin platform:</p>
                <h1>${authCode}</h1>
                <p>Your unique code will be valid for 15 minutes. If don't use it in this timeframe, you will have to login again and request a new one.</p>
            `
        }
        const hashedAuthCode = await bcrypt.hash(authCode, 10)
        const authRecord = {
            userId: _id,
            authCode: hashedAuthCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 900000
        }
        const alreadyAuthCode = await AuthConfirm.findOne({ userId: _id })
        if (alreadyAuthCode) {
            await AuthConfirm.updateOne(
                { userId: _id.toString() },
                { $set: authRecord }
            )
        } else {
            await AuthConfirm.create(authRecord)
        }
        await transport.sendMail(mailOptions)
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message })
    }
}

module.exports = router