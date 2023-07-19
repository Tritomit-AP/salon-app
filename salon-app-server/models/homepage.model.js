const mongoose = require('mongoose')

const Homepage = new mongoose.Schema(
    {
        title: { 
            type: String, 
            default: "Elevate Your Beauty Routine"
        }, 
        aboutUs: { 
            type: String, 
            default: "At Salon, we believe that everyone deserves to feel beautiful. That’s why we’re dedicated to helping you elevate your beauty routine with our luxurious treatments and expert stylists. Whether you’re looking for a fresh new haircut, a bold new color, or a relaxing spa day, we’ve got you covered. Our team of experienced professionals is passionate about helping you look and feel your best, and we’re committed to providing you with the highest level of service and care. Come visit us today and discover how we can help you elevate your beauty routine!"

        },
        latestCuts: {
            type: String
        }
    },
    { collection: 'homepage' }
)

const model = mongoose.model('Homepage', Homepage)

module.exports = model