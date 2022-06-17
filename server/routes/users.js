const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('../config')

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
    const user = await User.findOne({
        email: req.body.credentials.email,
    })

    if(!user) {
        return res.status(403).json({ success: false, error: 'Email or password are incorrect' })
    }

    const isPasswordValid = await bcrypt.compare(req.body.credentials.password, user.password)

    if(isPasswordValid) {
        const token = jwt.sign({
            name: user.name,
            email: user.email
        }, config.jwtSecret)
        
        return res.json({ success: true, token: token, user: user.withoutPassword() })
    } else {
        return res.status(401).json({ success: false, error: "Username or password are incorrect" })
    }
})

module.exports = router