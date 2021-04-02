const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')
const jws = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true

    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!isEmail(value)) {
                throw new Error('Please enter a valid email.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password field cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positve number.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer
    }
})


userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.tokens
    delete userObj.password
    delete userObj.avatar
    return userObj
}


userSchema.methods.generateAuthToken = async function () {
    const token = jws.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)
    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) throw new Error('Unable to login')
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('Unable to login')
    return user
}



userSchema.pre('save', async function (next) {  
    if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 8)
    next()
})

userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id })
    next()
})

const User = mongoose.model('User' , userSchema)




module.exports = User