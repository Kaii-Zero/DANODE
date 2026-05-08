const User = require('../models/user.model')
const bcrypt = require('bcrypt')

const { generateToken } = require('../helpers/jwt')
const { registerSchema, loginSchema } = require('../helpers/joi_helpers')

exports.register = async (req, res) => {
    try {

        // Validate
        const { error } = registerSchema.validate(req.body)

        if (error) {
            return res.send(error.message)
        }

        const { username, email, password } = req.body

        // Check user tồn tại
        const exist = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (exist) {
            return res.send('User hoặc Email đã tồn tại')
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10)

        // Create user
        await User.create({
            username,
            email,
            password: hash
        })

        res.redirect('/login')

    } catch (err) {
        res.send(err.message)
    }
}

exports.login = async (req, res) => {
    try {

        // Validate
        const { error } = loginSchema.validate(req.body)

        if (error) {
            return res.send(error.message)
        }

        const { username, password } = req.body

        // Find user
        const user = await User.findOne({ username })

        if (!user) {
            return res.send('Sai username')
        }

        // Compare password
        const match = await bcrypt.compare(
            password,
            user.password
        )

        if (!match) {
            return res.send('Sai password')
        }

        // Generate token
        const token = generateToken({
            id: user._id
        })

        // Save cookie
        res.cookie('token', token, {
        httpOnly: true,
        secure: false
    })

        return res.redirect('/all')

    } catch (err) {
        res.send(err.message)
    }
}

exports.logout = (req, res) => {
    res.clearCookie('token')
    res.redirect('/login')
}