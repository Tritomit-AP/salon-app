const jwtSecret = process.env.JWT_SECRET
const databaseURL = process.env.DATABASE_URL

module.exports = {
   jwtSecret: jwtSecret,
   databaseURL: databaseURL
}