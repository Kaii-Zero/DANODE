const Subscription = require('../models/subscription.model')

// Trang thông báo
exports.getNotifications = async (req, res) => {
    try {
        const now = new Date()
        
        // Lấy các subscription sắp hết hạn (còn 7 ngày)
        const expiringSubs = await Subscription.find({
            userId: req.user.id,
            status: 'paid',
            endDate: { 
                $gt: now,
                $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
        })
        
        // Lấy các subscription vừa mua thành công (trong 24h qua)
        const recentPurchases = await Subscription.find({
            userId: req.user.id,
            createdAt: { 
                $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            }
        })
        
        // Tạo danh sách thông báo
        const notifications = [
            ...recentPurchases.map(sub => ({
                type: 'success',
                title: 'Mua gói thành công!',
                message: `Bạn đã mua gói ${sub.name} thành công.`,
                time: sub.createdAt,
                read: false
            })),
            ...expiringSubs.map(sub => ({
                type: 'warning',
                title: 'Gói sắp hết hạn!',
                message: `Gói ${sub.name} sẽ hết hạn vào ngày ${new Date(sub.endDate).toLocaleDateString('vi-VN')}. Vui lòng gia hạn.`,
                time: sub.endDate,
                read: false
            }))
        ]
        
        // Sắp xếp theo thời gian mới nhất
        notifications.sort((a, b) => b.time - a.time)
        
        res.render('notifications/index', { 
            notifications,
            notificationCount: notifications.length
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi lấy thông báo')
    }
}

// API lấy số lượng thông báo chưa đọc
exports.getUnreadCount = async (req, res) => {
    try {
        const now = new Date()
        
        const expiringCount = await Subscription.countDocuments({
            userId: req.user.id,
            status: 'paid',
            endDate: { 
                $gt: now,
                $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
        })
        
        const recentCount = await Subscription.countDocuments({
            userId: req.user.id,
            createdAt: { 
                $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            }
        })
        
        res.json({ count: expiringCount + recentCount })
    } catch (error) {
        console.error(error)
        res.json({ count: 0 })
    }
}