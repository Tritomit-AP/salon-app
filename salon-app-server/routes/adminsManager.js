const express = require("express")
const router = express.Router()
const User = require('../models/user.model')
const { checkUser } = require('../middlewares/checkUser')

router.get('/get-list',
    checkUser,
    async (req, res) => {
        try {
            const userId = req.query.userId

            const adminsList = await User.find({ invitedBy: userId })

            res.json({ success: true, adminsList: adminsList })
        } catch (error) {
            res.status(500).json({ success: false, error: error.message })
        }
    }
)

router.delete('/delete-admin/:adminId',
    checkUser,
    async (req, res) => {
        try {
            const userId = req.query.userId
            const adminId = req.params.adminId
            const adminList = await User.find({ invitedBy: userId })
            const admin = adminList.find(obj => obj._id.toString() === adminId)

            if (!admin) {
                return res.status(404).json({ success: false, error: "This record does not exist. Please try again." })
            } else {
                await User.deleteOne({ _id: adminId })
            }

            res.json({ success: true, message: "Admin removed." })
        } catch (error) {
            res.status(500).json({ success: false, error: error.message })
        }
    }
)

module.exports = router