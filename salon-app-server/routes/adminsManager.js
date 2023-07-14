const express = require("express")
const router = express.Router()
const User = require('../models/user.model')
const EmailToken = require('../models/emailToken.model')
const { checkUser } = require('../middlewares/checkUser')

router.get('/get-list',
    checkUser,
    async (req, res) => {
        try {
            const userId = req.query.userId

            const connectedAdminList = await User.find({ invitedBy: userId })
            const pendingAdminList = await EmailToken.find({ userId: userId, action: "adminInviteEmail" })

            res.json({ success: true, connectedAdminList: connectedAdminList, pendingAdminList: pendingAdminList })
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

            const connectedAdminList = await User.find({ _id: adminId, invitedBy: userId })
            const pendingAdminList = await EmailToken.find({ _id: adminId, userId: userId, action: "adminInviteEmail" })

            if (!connectedAdminList && !pendingAdminList) {
                return res.status(404).json({ success: false, error: "This record does not exist. Please try again." })
            } else if (connectedAdminList.length) {
                await User.deleteOne({ _id: adminId })
                res.json({ success: true, message: "Connected admin removed." })
            } else {
                await EmailToken.deleteOne({ _id: adminId })
                res.json({ success: true, message: "Pending admin removed." })
            }

        } catch (error) {
            res.status(500).json({ success: false, error: error.message })
        }
    }
)

module.exports = router