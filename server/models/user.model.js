const mongoose = require('mongoose')

const User = new mongoose.Schema(
    {
        name: { type: String, required: true }, 
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    },
    { collection: 'user-data' }
)

User.methods.withoutPassword = function () {
    const user = this.toObject()
    delete user.password
    return user
}

const model = mongoose.model('UserData', User)

module.exports = model