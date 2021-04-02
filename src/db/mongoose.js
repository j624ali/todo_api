const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(() => console.log('Connected to database'))
.catch((e) => console.log('Database connection failed.', e));

