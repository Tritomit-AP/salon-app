const express = require('express')
const router = express.Router()
const Stylist = require('../../models/stylist.model')
const { checkUser } = require('../../middlewares/checkUser')
const { body, validationResult } = require('express-validator')

router.post('/create', 
    checkUser,
    body(['name', 'bio', 'photo', 'portfolio']).not().isEmpty().withMessage("Some vital information is missing...").trim().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }

        const { name, bio, photo, portfolio } = req.body

        try {
            let newStylist = await Stylist.create({
                name: name, 
                bio: bio, 
                photo: photo, 
                portfolio: portfolio
            })

            res.status(200).json({ success: true, stylist: newStylist })

        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
})

router.patch('/update/:stylistId', 
    checkUser,
    body(['name', 'bio', 'photo', 'portfolio']).optional({ checkFalsy: true }).trim().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map(error => error.msg) })
        }
        
        const { name, bio, photo, portfolio } = req.body
        const { stylistId } = req.params

        try {
            const stylist = await Stylist.findById(stylistId)

            if (!stylist) {
                return res.status(404).json({ success: false, error: "This record does not exist. Please try again." })
            } else {

                if (name) stylist.name = name
                if (bio) stylist.bio = bio
                if (photo) stylist.photo = photo
                if (portfolio) stylist.portfolio = portfolio

                const updatedStylist = await stylist.save()

                res.status(200).json({ success: true, updatedStylist: updatedStylist }) 
            }
        } catch (error) {
            res.status(400).json({ success: false, error: error.message })
        }
})

router.delete('/delete/:stylistId',
    checkUser,
    async (req, res) => {
        try {
            const { stylistId } = req.params

            const stylist = await Stylist.findById(stylistId)

            if (!stylist) {
                return res.status(404).json({ success: false, error: "This record does not exist. Please try again." })
            } else {
                await Stylist.deleteOne({ _id: stylistId })
                res.json({ success: true, message: "Stylist removed." })
            }

        } catch (error) {
            res.status(500).json({ success: false, error: error.message })
        }
    }
)

module.exports = router