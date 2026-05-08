const Subscription = require('../models/subscription.model')
const Service = require('../models/service.model')

// Kiểm tra và gia hạn tự động
const checkAndAutoRenew = async () => {
    try {
        const now = new Date()
        
        // Tìm các subscription sắp hết hạn (trong vòng 1 ngày) và bật autoRenew
        const expiringSubs = await Subscription.find({
            status: 'paid',
            autoRenew: true,
            endDate: {
                $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Trong 24h tới
                $gte: now
            }
        }).populate('serviceId')
        
        console.log(`📋 Tìm thấy ${expiringSubs.length} subscription cần gia hạn tự động`)
        
        for (const sub of expiringSubs) {
            await autoRenewSubscription(sub)
        }
        
        // Cũng kiểm tra các subscription đã hết hạn nhưng chưa được gia hạn
        const expiredSubs = await Subscription.find({
            status: 'paid',
            autoRenew: true,
            endDate: { $lt: now }
        }).populate('serviceId')
        
        console.log(`⚠️ Tìm thấy ${expiredSubs.length} subscription đã hết hạn cần gia hạn`)
        
        for (const sub of expiredSubs) {
            await autoRenewSubscription(sub)
        }
        
    } catch (error) {
        console.error('Lỗi auto-renew:', error)
    }
}

// Gia hạn một subscription
const autoRenewSubscription = async (subscription) => {
    try {
        const service = subscription.serviceId
        if (!service) {
            console.log(`❌ Không tìm thấy service cho subscription ${subscription._id}`)
            return
        }
        
        const now = new Date()
        
        // Tính số tháng cần gia hạn (dựa trên quantity hiện tại)
        const renewQuantity = subscription.quantity || 1
        const unitPrice = service.price || subscription.price / renewQuantity
        
        // Tính giá
        const discountRate = service.discount || 0
        const basePrice = unitPrice * renewQuantity
        const discountMoney = basePrice * (discountRate / 100)
        const finalPrice = Math.max(0, basePrice - discountMoney)
        
        // Cập nhật ngày hết hạn mới
        let baseDate = subscription.endDate && subscription.endDate > now 
            ? new Date(subscription.endDate)
            : now
        baseDate.setDate(baseDate.getDate() + (30 * renewQuantity))
        
        // Lưu lịch sử gia hạn
        subscription.autoRenewHistory = subscription.autoRenewHistory || []
        subscription.autoRenewHistory.push({
            renewedAt: now,
            amount: finalPrice,
            quantity: renewQuantity,
            status: 'success'
        })
        
        // Cập nhật subscription
        subscription.endDate = baseDate
        subscription.lastAutoRenew = now
        subscription.price = (subscription.price || 0) + finalPrice
        
        await subscription.save()
        
        console.log(`✅ Đã tự động gia hạn: ${subscription.name} - Thêm ${renewQuantity} tháng - Phí: $${finalPrice}`)
        
        // TODO: Gửi email thông báo hoặc tạo notification
        
    } catch (error) {
        console.error(`❌ Lỗi gia hạn tự động cho ${subscription._id}:`, error)
        
        // Ghi lại lịch sử thất bại
        if (subscription) {
            subscription.autoRenewHistory = subscription.autoRenewHistory || []
            subscription.autoRenewHistory.push({
                renewedAt: new Date(),
                amount: 0,
                quantity: 0,
                status: 'failed',
                error: error.message
            })
            await subscription.save()
        }
    }
}

// Bật/tắt auto-renew cho subscription
const toggleAutoRenew = async (subscriptionId, userId, enabled) => {
    try {
        const subscription = await Subscription.findOne({
            _id: subscriptionId,
            userId: userId
        })
        
        if (!subscription) {
            throw new Error('Không tìm thấy subscription')
        }
        
        subscription.autoRenew = enabled
        await subscription.save()
        
        return {
            success: true,
            autoRenew: enabled,
            message: enabled ? 'Đã bật tự động gia hạn' : 'Đã tắt tự động gia hạn'
        }
    } catch (error) {
        console.error('Toggle auto-renew error:', error)
        throw error
    }
}

// Lấy danh sách subscription có auto-renew
const getAutoRenewSubscriptions = async (userId) => {
    return await Subscription.find({
        userId: userId,
        autoRenew: true,
        status: 'paid'
    })
}

module.exports = {
    checkAndAutoRenew,
    autoRenewSubscription,
    toggleAutoRenew,
    getAutoRenewSubscriptions
}