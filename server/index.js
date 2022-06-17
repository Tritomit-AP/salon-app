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

//connect db
mongoose.connect(config.databaseURL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))

//routes
app.use('/users', require('./routes/users'))
app.use('/api/description', require('./routes/description'))

//error handling
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