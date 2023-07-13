const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const config = require('../config')
const AuthConfirm = require('../models/authConfirm.model')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: config.authEmail,
        pass: config.authEmailPass
    }
})

const sendAuthCodeEmail = async ({ _id, email, name }, res) => {
    try {
        const authCode = crypto.randomBytes(3).toString("hex").toUpperCase()
        const mailOptions = {
            from: "support@client.com",
            to: email,
            subject: "Your authentication code",
            html: `
                <h1>Hi ${name}</h1>
                <p>This is your authentication code requested from Client:</p>
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

module.exports = {
    sendAuthCodeEmail
}