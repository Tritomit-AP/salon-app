const express = require('express')
const router = express.Router()
const Description = require('../models/description.model')

router.get('/', async (req, res) => {
    try {
        const description = await Description.find()
        res.json({ success: true, description: description })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const description = await Description.find()
        if (description < 1) {
            await Description.create({
                title: req.body.description.title,
                about: req.body.description.about
            })
        } else {
            const { title, about } = req.body
            let filteredDescription = {}
            if (title) filteredDescription["title"] = title
            if (about) filteredDescription["about"] = about
            await Description.updateOne(
                { $set: filteredDescription }
            )
        }
        const newDescription = await Description.find()
        res.status(201).json({ success: true, newDescription: newDescription })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
})

module.exports = router