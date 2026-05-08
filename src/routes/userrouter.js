const router = require('express').Router()
const userController = require('../controllers/usercontrollers')
const { ensureGuest } = require('../middlewares/auth')

// View - chỉ cho phép khi chưa đăng nhập
router.get('/login', ensureGuest, (req, res) => {
    res.render('auth/login', { error: null })
})

router.get('/register', ensureGuest, (req, res) => {
    res.render('auth/register', { error: null })
})

// Xử lý - QUAN TRỌNG: Phải đúng method và đường dẫn
router.post('/login', userController.login)
router.post('/register', userController.register)
router.get('/logout', userController.logout)

module.exports = router