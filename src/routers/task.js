const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

// create a task
router.post('/task', auth, async (req, res) => {
    try {
        const newTask = new Task({
            ...req.body,
            owner: req.user._id
        })
        const task = await newTask.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// get one task
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) return res.status(404).send()
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }

})

// update a task
router.patch('/tasks/:id', auth,async (req, res) => {
    const allowedUpdates = ['description', 'completed']
    const requestedUpdates = Object.keys(req.body)
    const isAllowed = requestedUpdates.every((update) => allowedUpdates.includes(update))
    if (!isAllowed) return res.status(400).send({ error: 'Invalid updates' })

    try {

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) return res.status(400).send()
        requestedUpdates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.status(200).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) return res.status(400).send()
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

// get all tasks
router.get('/tasks', auth, async (req, res) => {
    const match = new Object
    const sort = new Object
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                skip: parseInt(req.query.skip),
                limit: parseInt(req.query.limit),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    } 
})



module.exports = router