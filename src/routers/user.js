const express = require('express')
const User = require('../models/user')
const multer = require('multer')
const router = new express.Router()
const auth = require('../middleware/auth')
const sharp = require('sharp')
const { sendWelcomeEmail, sendAccountClosureEmail } = require('../emails/account')



// get user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})
    


// get one user
router.get('/users/:id', async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.findById(_id)
        if (!user) return res.status(404).send()
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

// update a user
router.patch('/users' , auth, async (req, res) => {
    const allowedUpdates = ['password', 'name', 'email', 'age']
    const requestedUpdates = Object.keys(req.body)
    const isAllowed = requestedUpdates.every((update) => allowedUpdates.includes(update))

    if (!isAllowed) return res.status(400).send({ error: 'Invalid updates.' })

    try {


        requestedUpdates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }   
})

// delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendAccountClosureEmail(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})


// user signup
router.post('/users/signup', async (req, res) => {
    try {
        const newUser = new User(req.body)
        const user = await newUser.save()
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

// user login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (error) {
        res.status(400).send('error')
    }
})

// user logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send(user1)
    } catch (error) {
        res.status(500).send()
    }
})



router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

const avatarUpload = multer({
    limits: {
        fileSize: 1000000,   
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            return cb(new Error('Please upleade a jpg, png, or jpeg.'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(201).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})


module.exports = router