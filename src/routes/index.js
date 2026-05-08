const express = require('express')
const router = express.Router()
const subController = require('../controllers/subcontrollers')
const { ensureAuth } = require('../middlewares/auth')
const notificationController = require('../controllers/notificationController')
const Subscription = require('../models/subscription.model')

// Trang chủ - Dashboard chính (KHÔNG redirect)
router.get('/', ensureAuth, async (req, res) => {
    try {
        console.log('Trang chủ đang được gọi!');
        
        // Lấy danh sách subscription đã thanh toán của user
        const subscriptions = await Subscription.find({ 
            userId: req.user.id,
            status: 'paid'
        })
        
        const now = new Date()
        
        // Xử lý từng subscription
        const services = subscriptions.map(sub => {
            let status = 'Còn hạn'
            let daysLeft = null
            
            if (sub.endDate) {
                const diff = (new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24)
                daysLeft = Math.ceil(diff)
                
                if (diff < 0) status = 'Hết hạn'
                else if (diff <= 7) status = 'Sắp hết'
            }
            
            return {
                _id: sub._id,
                name: sub.name,
                price: sub.price,
                logo: sub.logo,
                provider: sub.provider,
                packageType: sub.packageType,
                status: status,
                daysLeft: daysLeft,
                endDate: sub.endDate
            }
        })
        
        // Tính tổng chi phí
        const totalCost = services.reduce((sum, s) => sum + (s.price || 0), 0)
        
        // Dịch vụ sắp hết hạn
        const expiringList = services.filter(s => s.status === 'Sắp hết')
        const expiringCount = expiringList.length
        
        // Render file all.ejs
        res.render('all', {
            services: services,
            totalCost: totalCost,
            expiringCount: expiringCount,
            expiringList: expiringList,
            user: req.session.user
        })
    } catch (error) {
        console.error('Home error:', error)
        res.status(500).send('Lỗi tải trang chủ')
    }
})

// Route thông báo
router.get('/notifications', ensureAuth, notificationController.getNotifications)
router.get('/api/notifications/count', ensureAuth, notificationController.getUnreadCount)

module.exports = router