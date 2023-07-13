const User = require('../models/user.model')

const checkUser = (req, res, next) => {

    const userId = req.auth.userId
    const ownerId = req.query.userId

    try {
        const user = User.findById(ownerId)
        if (!user) {
            return res.status(404).json({ success: false, error: "Cannot find user" })
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }

    if (userId !== ownerId) {
        return res.status(401).json({ success: false, error: "You don't have permission to do this" })
    }
    next()
}

module.exports = {
    checkUser
}