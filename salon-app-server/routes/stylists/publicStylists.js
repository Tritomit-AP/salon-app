const express = require('express')
const router = express.Router()
const Stylist = require('../../models/stylist.model')

router.get('/', 
    async (req, res) => {
    try {
        const stylists = await Stylist.find()

        if (!stylists) {
            res.status(404).json({ success: false, error: "There is no record to show." })
        } else { 
            res.json({ success: true, stylists: stylists })
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/:stylistId', 
    async (req, res) => {
    try {
        const { stylistId } = req.params
        const stylist = await Stylist.findOne({ _id: stylistId })

        if (!stylist) {
            res.status(404).json({ success: false, error: "This record does not exist. Please try again." })
        } else {
            res.json({ success: true, stylist: stylist })
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

module.exports = router