const jwtSecret = process.env.JWT_SECRET
const databaseURL = process.env.DATABASE_URL
const authEmail = process.env.AUTH_EMAIL
const authEmailPass = process.env.AUTH_EMAIL_PASS
const clientURL = process.env.CLIENT_URL

module.exports = {
   jwtSecret: jwtSecret,
   databaseURL: databaseURL,
   authEmail,
   authEmailPass,
   clientURL
}