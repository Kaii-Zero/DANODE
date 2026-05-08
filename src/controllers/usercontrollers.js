const User = require('../models/user.model')
const bcrypt = require('bcryptjs')

// Đăng ký
exports.register = async (req, res) => {
    try {
        console.log('Register body:', req.body) // Debug
        
        const { email, password, name } = req.body
        
        if (!email || !password) {
            return res.render('auth/register', { error: 'Vui lòng nhập đầy đủ thông tin' })
        }
        
        // Kiểm tra user đã tồn tại
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.render('auth/register', { error: 'Email đã tồn tại' })
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        // Tạo user mới
        const user = new User({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0]
        })
        
        await user.save()
        console.log('User created:', user._id)
        
        // Lưu session
        req.session.userId = user._id.toString()
        req.session.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name
        }
        
        req.session.save((err) => {
            if (err) {
                console.error('Session error:', err)
                return res.render('auth/register', { error: 'Đăng ký thất bại' })
            }
            console.log('Session saved, redirecting to /subs')
            res.redirect('/subs')
        })
        
    } catch (error) {
        console.error('Register error:', error)
        res.render('auth/register', { error: 'Đăng ký thất bại: ' + error.message })
    }
}

// Đăng nhập
exports.login = async (req, res) => {
    try {
        console.log('Login body:', req.body) // Debug
        
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.render('auth/login', { error: 'Vui lòng nhập email và mật khẩu' })
        }
        
        // Tìm user
        const user = await User.findOne({ email })
        if (!user) {
            return res.render('auth/login', { error: 'Email hoặc mật khẩu không đúng' })
        }
        
        // So sánh password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.render('auth/login', { error: 'Email hoặc mật khẩu không đúng' })
        }
        
        console.log('Login success:', user._id)
        
        // Lưu session
        req.session.userId = user._id.toString()
        req.session.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name
        }
        
        req.session.save((err) => {
            if (err) {
                console.error('Session error:', err)
                return res.render('auth/login', { error: 'Đăng nhập thất bại' })
            }
            console.log('Session saved, userId:', req.session.userId)
            res.redirect('/subs')
        })
        
    } catch (error) {
        console.error('Login error:', error)
        res.render('auth/login', { error: 'Đăng nhập thất bại' })
    }
}

// Đăng xuất
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err)
        }
        res.redirect('/login')
    })
}