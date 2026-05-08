const express = require('express')
const router = express.Router()
const User = require('../models/user.model')

// Route mặc định
router.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/subs')
    } else {
        res.redirect('/login')
    }
})

// Route đăng ký
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body
        
        // Kiểm tra user đã tồn tại
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.render('auth/register', { error: 'Email đã tồn tại' })
        }
        
        // Tạo user mới
        const user = new User({
            email,
            password,
            name: name || email.split('@')[0]
        })
        
        await user.save()
        
        // Lưu session
        req.session.userId = user._id
        req.session.user = {
            id: user._id,
            email: user.email,
            name: user.name
        }
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('auth/register', { error: 'Đăng ký thất bại' });
            }
            res.redirect('/subs')
        })
        
    } catch (error) {
        console.error(error)
        if (error.code === 11000) {
            return res.render('auth/register', { error: 'Email đã được sử dụng' })
        }
        res.render('auth/register', { error: 'Đăng ký thất bại: ' + error.message })
    }
})

// Route đăng nhập
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.render('auth/login', { error: 'Vui lòng nhập email và mật khẩu' })
        }
        
        // Tìm user
        const user = await User.findOne({ email })
        if (!user) {
            return res.render('auth/login', { error: 'Email hoặc mật khẩu không đúng' })
        }
        
        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.render('auth/login', { error: 'Email hoặc mật khẩu không đúng' })
        }
        
        // Lưu session
        req.session.userId = user._id
        req.session.user = {
            id: user._id,
            email: user.email,
            name: user.name
        }
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('auth/login', { error: 'Đăng nhập thất bại' });
            }
            res.redirect('/subs')
        })
        
    } catch (error) {
        console.error(error)
        res.render('auth/login', { error: 'Đăng nhập thất bại' })
    }
})

// Route đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err)
        }
        res.redirect('/login')
    })
})

// Route đăng nhập page
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null })
})

// Route đăng ký page
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null })
})

module.exports = router