require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./config')
const { expressjwt: jwt } = require('express-jwt');

app.use(cors())
app.use(express.json())
app.use('/api', jwt({ secret: config.jwtSecret,  algorithms: ['HS256'] }))

// connect db
mongoose.connect(config.databaseURL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))

// public routes
app.use('/users', require('./routes/users'))
app.use('/auth-confirm', require('./routes/authConfirm'))
app.use('/forgot-password', require('./routes/forgotPassword'))
app.use('/update-credentials/email-update-reset', require('./routes/emailUpdateReset'))
app.use('/add-admin/create', require('./routes/addAdminCreate'))
app.use('/homepage', require('./routes/homepage/publicHomepage'))
app.use('/stylists', require('./routes/stylists/publicStylists'))

// private routes
app.use('/api/update-credentials', require('./routes/updateCredentials'))
app.use('/api/add-admin', require('./routes/addAdmin'))
app.use('/api/admins-manager', require('./routes/adminsManager'))
app.use('/api/homepage', require('./routes/homepage/homepage'))
app.use('/api/stylists', require('./routes/stylists/stylists'))

// error handling
app.use((err, req, res, next) => {
    console.error(err)
    if (err.name === "UnauthorizedError") {
        res.status(err.status)
    }
    return res.status(403).json({ message: err.message })
})

app.listen(1337, () => {
    console.log("Server started on 1337")
})