const mongoose = require('mongoose')

const AuthConfirm = new mongoose.Schema(
    {
        userId: { type: String }, 
        authCode: { type: String },
        createdAt: { type: Date },
        expiresAt: { type: Date }
    },
    { collection: 'auth-records' }
)

const model = mongoose.model('AuthConfirm', AuthConfirm)

module.exports = model