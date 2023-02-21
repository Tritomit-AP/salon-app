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

const model = mongoose.model('AuthData', AuthConfirm)

module.exports = model