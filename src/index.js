// express config
const express = require('express')
const app = express()
// make express automatically parse incomming json data
app.use(express.json())

const port = process.env.PORT

// load in DB file
require('./db/mongoose')

// load in user router
const userRouter = require('./routers/user')
app.use(userRouter)

// load in task router
const taskRouter = require('./routers/task')
app.use(taskRouter)





//hello
// initialize server
app.listen(port, () => {
    console.log(`SERVER LISTENING ON PORT ${port}....`)
})



