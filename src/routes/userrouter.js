const router = require('express').Router()
const userController = require('../controllers/usercontrollers')

// view
router.get('/login', (req, res) => res.render('auth/login'))
router.get('/register', (req, res) => res.render('auth/register'))

// xử lý
router.post('/login', userController.login)
router.post('/register', userController.register)
router.get('/logout', userController.logout)

module.exports = router