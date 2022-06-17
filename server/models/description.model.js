const mongoose = require('mongoose')

const Description = new mongoose.Schema(
    {
        title: { type: String }, 
        about: { type: String },
    },
    { collection: 'website-data' }
)

const model = mongoose.model('WebsiteData', Description)

module.exports = model