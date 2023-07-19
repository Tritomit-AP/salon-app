require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Homepage = require('./models/homepage.model')
const Stylist = require('./models/stylist.model')
const config = require('./config')

// connect db
mongoose.connect(config.databaseURL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))
 
const users = [
    { name: 'Adrian', email: 'adrian@web.de', password: config.initialPass, invitedBy: null, providedAuth: false, },
    { name: 'Lucian', email: 'lucian@web.de', password: config.initialPass, invitedBy: null, providedAuth: false, },
]

const homepage = [
    { 
        title: "Elevate Your Beauty Routine", 
        about: "At Salon, we believe that everyone deserves to feel beautiful. That’s why we’re dedicated to helping you elevate your beauty routine with our luxurious treatments and expert stylists. Whether you’re looking for a fresh new haircut, a bold new color, or a relaxing spa day, we’ve got you covered. Our team of experienced professionals is passionate about helping you look and feel your best, and we’re committed to providing you with the highest level of service and care. Come visit us today and discover how we can help you elevate your beauty routine!",
        latestCuts: "some latest cuts..."
    }
]

const stylists = [
    { 
        name: "Ethan Mitchell", 
        bio: "Ethan brings a fresh and dynamic approach to every haircut and color he creates. His expertise lies in understanding his clients' unique preferences and personalities, ensuring that each look is tailored to perfection. Whether it's a classic cut or a bold new trend, Ethan's skillful hands and friendly demeanor make every visit to The Modern Mane Salon a memorable experience. Trust Ethan Mitchell to elevate your hair game, leaving you with a modern, sophisticated, and effortlessly stylish look that turns heads and boosts your confidence.",
        photo: "some photo...",
        portfolio: "some portfolio..."
    },
    { 
        name: "Olivia Harper", 
        bio: "With an artistic flair and a deep understanding of hair, Olivia creates personalized styles that are as unique as you are. From cutting-edge cuts to vibrant colors, her passion for innovation and precision shines through in every masterpiece she creates. With a warm and welcoming demeanor, Olivia ensures every client feels valued and heard, making their hair dreams come to life. Step into Tresses & Trends Salon and let Olivia Harper transform your hair into a stunning expression of your individuality, leaving you feeling confident, beautiful, and ready to conquer the world with style.",
        photo: "some photo...",
        portfolio: "some portfolio..."
    },

]


const seedData = async () => {
    try {

        await Homepage.deleteMany({})
        await Homepage.insertMany(homepage)

        await Stylist.deleteMany({})
        await Stylist.insertMany(stylists)

        console.log('Data seeding completed successfully')
    } catch (err) {
        console.error('Data seeding error:', err)
    }
}

seedData().then(() => mongoose.connection.close())