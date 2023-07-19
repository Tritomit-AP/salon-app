const mongoose = require('mongoose')

const Stylist = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true,
        }, 
        bio: { 
            type: String, 
            required: true,
        },
        photo: {
            type: String,
            required: true,
        }, 
        portfolio: {
            type: String,
            required: true,
        }
    },
    { collection: 'stylists' }
)

const model = mongoose.model('Stylist', Stylist)

module.exports = model