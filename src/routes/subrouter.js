const express = require('express')
const router = express.Router()
const subController = require('../controllers/subcontrollers')
const { ensureAuth } = require('../middlewares/auth')
const Subscription = require('../models/subscription.model')  // ← THÊM DÒNG NÀY

// Áp dụng middleware authentication cho TẤT CẢ các route trong subrouter
router.use(ensureAuth)

// Dashboard
router.get('/', subController.list)

// Tạo mới
router.get('/create', subController.addPage)
router.post('/create', subController.create)

// Payment page
router.get('/payment/:subId', subController.showPayment)

// Xác nhận thanh toán
router.post('/confirm', subController.confirm)

// Gia hạn
router.post('/extend/:id', subController.extend)

// Xóa
router.post('/delete/:id', subController.delete)

// Bật/tắt tự động gia hạn
router.post('/auto-renew/:id/toggle', subController.toggleAutoRenew)
router.get('/auto-renew/list', subController.getAutoRenewList)

// Debug route - kiểm tra subscription (TẠM THỜI, SAU ĐÓ XÓA)
router.get('/debug/subscriptions', ensureAuth, async (req, res) => {
    try {
        const subs = await Subscription.find({ userId: req.user.id })
        res.json(subs.map(s => ({ 
            _id: s._id, 
            name: s.name, 
            autoRenew: s.autoRenew || false 
        })))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router