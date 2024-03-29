const mongoose = require('mongoose')

const ResetToken = new mongoose.Schema(
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
        createdAt: {
            type: Date,
            default: Date.now,
            index: { expires: 3600 }
        },
    },
    { collection: 'reset-tokens' }
)

const model = mongoose.model('ResetToken', ResetToken)

module.exports = model