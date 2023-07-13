const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const EmailToken = require('../models/emailToken.model')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')

const regex = new RegExp(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)

router.post('/',
    body(['name', 'password', 'invitedBy', 'token']).not().isEmpty().withMessage("Some vital information is missing..."),
    body('password').matches(regex).withMessage("Password does not meet all requirements."),
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }

        const { name, email, password, invitedBy, token } = req.body
    
        try {
            const existingUser = await User.findOne({ email: email })
            const existingToken = await EmailToken.findOne({ userId: invitedBy })
            
            if (!existingToken) {
                return res.status(404).json({ success: false, error: "Token has expired or it's invalid" })
            }

            const isValidEmailToken = await bcrypt.compare(token, existingToken.token)

            if (!isValidEmailToken) {
                return res.status(498).json({ success: false, error: "Token has expired or it's invalid" })
            }

            if (existingUser) {
                return res.status(409).json({ success: false, error: 'This user already exists.' })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)

                const newUser = await User.create({
                    name: name,
                    email: existingToken.newEmail,
                    password: hashedPassword,
                    invitedBy: invitedBy,
                })
                await EmailToken.deleteMany({ invitedBy })

                res.status(200).json({ success: true, user: newUser.withoutPassword() })
            }
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
)

module.exports = router