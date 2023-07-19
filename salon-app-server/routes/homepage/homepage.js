const express = require('express')
const router = express.Router()
const Homepage = require('../../models/homepage.model')
const { checkUser } = require('../../middlewares/checkUser')
const { body, validationResult } = require('express-validator')

router.patch('/', 
    checkUser,
    body(['title', 'aboutUs', 'latestCuts']).optional({ checkFalsy: true }).trim().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }

        const { title, aboutUs, latestCuts } = req.body

        try {
            let homepage = await Homepage.find()

            if (!homepage.length) {
                res.status(404).json({ success: false, error: "Information on homepage is missing" })
            } else { 

                if (aboutUs) homepage[0].aboutUs = aboutUs
                if (title) homepage[0].title = title
                if (latestCuts) homepage[0].latestCuts = latestCuts

                const updatedHomepage = await homepage[0].save()
    
                res.status(200).json({ success: true, homepage: updatedHomepage })
            }
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
})

module.exports = router