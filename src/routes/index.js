// const router = require('express').Router()

// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

// const auth = require('../helpers/auth')

// // MODEL USER
// const User = require('../models/user.model')

// // LOGIN PAGE
// router.get('/login', (req, res) => {
//     res.render('auth/login')
// })

// // REGISTER PAGE
// router.get('/register', (req, res) => {
//     res.render('auth/register')
// })


// // REGISTER HANDLE
// router.post('/register', async (req, res) => {

//     try {

//         const { email, password } = req.body

//         // Kiểm tra email tồn tại
//         const existUser = await User.findOne({ email })

//         if (existUser) {
//             return res.send('Email đã tồn tại')
//         }

//         // Hash password
//         const hashPassword = await bcrypt.hash(password, 10)

//         // Tạo user mới
//         const user = await User.create({
//             email,
//             password: hashPassword
//         })

//         res.redirect('/login')

//     } catch (err) {

//         console.log(err)

//         res.status(500).send('Server Error')
//     }

// })


// // LOGIN HANDLE
// router.post('/login', async (req, res) => {

//     try {

//         const { email, password } = req.body

//         // Tìm user
//         const user = await User.findOne({ email })

//         if (!user) {
//             return res.send('Tài khoản không tồn tại')
//         }

//         // So sánh password
//         const isMatch = await bcrypt.compare(
//             password,
//             user.password
//         )

//         if (!isMatch) {
//             return res.send('Sai mật khẩu')
//         }

//         // Tạo token
//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 email: user.email
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: '1d'
//             }
//         )

//         // Lưu cookie
//         res.cookie('token', token, {
//             httpOnly: true
//         })

//         // Login thành công
//         res.redirect('/')

//     } catch (err) {

//         console.log(err)

//         res.status(500).send('Server Error')
//     }

// })

// // HOME
// router.get('/', auth, async (req, res) => {

//     const books = []

//     res.render('books/all', {
//         books,
//         user: req.user
//     })

// })

// // LOGOUT
// router.get('/logout', (req, res) => {

//     res.clearCookie('token')

//     res.redirect('/login')

// })

// module.exports = router

















const router = require('express').Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user.model')

const auth = require('../helpers/auth')


// ================= LOGIN PAGE =================

router.get('/login', (req, res) => {

    res.render('auth/login', {
        layout: false
    })

})


// ================= REGISTER PAGE =================

router.get('/register', (req, res) => {
    res.render('auth/register', {
        layout: false // Tắt main.ejs
    })

})


// ================= REGISTER HANDLE =================

router.post('/register', async (req, res) => {

    try {

        const { username, email, password } = req.body

        // CHECK EMAIL
        const existUser = await User.findOne({ email })

        if (existUser) {
            return res.send('Email đã tồn tại')
        }

        // HASH PASSWORD
        const hashPassword = await bcrypt.hash(password, 10)

        // CREATE USER
        await User.create({
            username,
            email,
            password: hashPassword
        })

        // CHUYỂN LOGIN
        res.redirect('/login')

    } catch (err) {

        console.log(err)

        res.status(500).send('Server Error')
    }

})


// ================= LOGIN HANDLE =================

router.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body

        console.log(username)
        console.log(password)

        // FIND USER
        const user = await User.findOne({
            username
        })

        console.log(user)

        // KHÔNG TỒN TẠI
        if (!user) {
            return res.send('Tài khoản không tồn tại')
        }

        // CHECK PASSWORD
        const isMatch = await bcrypt.compare(
            password,
            user.password
        )

        console.log(isMatch)

        // SAI PASSWORD
        if (!isMatch) {
            return res.send('Sai mật khẩu')
        }

        // CREATE TOKEN
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )

        // SAVE COOKIE
        res.cookie('token', token, {
            httpOnly: true
        })

        // LOGIN SUCCESS
        res.redirect('/')

    } catch (err) {

        console.log(err)

        res.status(500).send(err.message)
    }

})


// ================= HOME =================

router.get('/', auth, async (req, res) => {

    const books = []

    res.render('books/all', {
        books,
        user: req.user
    })

})


// ================= LOGOUT =================

router.get('/logout', (req, res) => {

    res.clearCookie('token')

    res.redirect('/login')

})


module.exports = router