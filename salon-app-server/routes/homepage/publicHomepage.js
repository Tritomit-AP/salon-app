const express = require('express')
const router = express.Router()
const Homepage = require('../../models/homepage.model')

router.get('/', 
    async (req, res) => {
    try {
        const homepage = await Homepage.find()
        res.json({ success: true, homepage: homepage[0] })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})



module.exports = router