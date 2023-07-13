const mongoose = require('mongoose')

const EmailToken = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        token: {
            type: String,
            required: true,
        },
        newEmail: {
            type: String,
            required: true,
            unique: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: { expires: 86400 }
        }
    },
    { collection: 'email-tokens' }
)

const model = mongoose.model('EmailToken', EmailToken)

module.exports = model