const Service = require('../models/service.model')
const Subscription = require('../models/subscription.model')
const subService = require('../services/subService')
const { ObjectId } = require('mongoose').Types
const autoRenewService = require('../services/autoRenewService')

// ID user mặc định
const DEFAULT_USER_ID = new ObjectId('65f8f5a5f3a5f5a5f5a5f5a5')

/* ================= LIST (DASHBOARD) - Lấy đúng user ================= */
exports.list = async (req, res) => {
    try {
        // Chỉ lấy subscription của user đang đăng nhập
        const subs = await Subscription.find({
            userId: req.user.id // Lấy từ middleware auth
        }).populate('serviceId')

        const now = new Date()
        
        // Group theo serviceId
        const groupedMap = new Map()
        
        subs.forEach(sub => {
            const serviceId = sub.serviceId?._id?.toString() || sub.serviceId?.toString()
            
            // Tính quantityFromDays
            let quantityFromDays = sub.quantity || 1
            if (sub.endDate) {
                const diff = (new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24)
                quantityFromDays = Math.ceil(Math.max(diff, 0) / 30)
            }
            
            if (groupedMap.has(serviceId)) {
                const existing = groupedMap.get(serviceId)
                existing.totalQuantity += sub.quantity
                existing.totalPrice += sub.price
                if (sub.endDate && (!existing.endDate || sub.endDate > existing.endDate)) {
                    existing.endDate = sub.endDate
                }
            } else {
                let status = 'Còn hạn'
                let daysLeft = null
                
                if (sub.endDate) {
                    const diff = (new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24)
                    daysLeft = Math.ceil(diff)
                    if (diff < 0) status = 'Hết hạn'
                    else if (diff <= 7) status = 'Sắp hết'
                }
                
                groupedMap.set(serviceId, {
                    _id: sub._id,
                    serviceId: sub.serviceId?._id || sub.serviceId,
                    name: sub.name,
                    logo: sub.logo,
                    type: sub.type,
                    provider: sub.provider,
                    totalQuantity: sub.quantity,
                    totalPrice: sub.price,
                    endDate: sub.endDate,
                    status: status,
                    daysLeft: daysLeft,
                    quantity: quantityFromDays,  // Đã định nghĩa
                    autoRenew: sub.autoRenew || false
                })
            }
        })
        
        const data = Array.from(groupedMap.values())
        
        const totalServices = data.length
        const totalCost = data.reduce((sum, s) => sum + (s.totalPrice || 0), 0)
        const totalQuantity = data.reduce((sum, s) => sum + (s.totalQuantity || 1), 0)
        
        const expiringList = data.filter(item => {
            if (!item.endDate) return false
            const diffDays = (new Date(item.endDate) - now) / (1000 * 60 * 60 * 24)
            return diffDays <= 30 && diffDays > 0
        })
        
        res.render('subs/dashboard', {
            subs: data,
            totalServices,
            totalCost,
            expiringSoon: expiringList.length,
            expiringList,
            totalQuantity
        })
    } catch (error) {
        console.error('List error:', error)
        res.status(500).send('Lỗi lấy danh sách')
    }
}

/* ================= CREATE - Gán đúng user ID ================= */
exports.create = async (req, res) => {
    try {
        const service = await Service.findById(req.body.serviceId)
        if (!service) return res.send("Service not found")
        
        let quantity = Number(req.body.quantity)
        if (isNaN(quantity) || quantity < 1) quantity = 1
        
        // Tạo subscription với user ID thật từ session
        const sub = await Subscription.create({
            userId: req.user.id, // Lấy từ middleware auth
            serviceId: service._id,
            name: service.name,
            logo: service.logo,
            type: service.type,
            provider: service.provider,
            quantity: quantity,
            price: service.price * quantity,
            status: 'pending',
            startDate: new Date(),
            endDate: new Date(Date.now() + (30 * quantity * 24 * 60 * 60 * 1000))
        })
        
        return res.redirect(`/subs/payment/${sub._id}`)
    } catch (error) {
        console.error('Create error:', error)
        res.status(500).send("Lỗi tạo đơn hàng: " + error.message)
    }
}

/* ================= SHOW PAYMENT PAGE ================= */
exports.showPayment = async (req, res) => {
    try {
        const { subId } = req.params
        
        const subscription = await Subscription.findById(subId).populate('serviceId')
        
        if (!subscription) {
            return res.status(404).send("Không tìm thấy đơn hàng")
        }
        
        const service = subscription.serviceId
        
        if (!service) {
            return res.status(404).send("Không tìm thấy dịch vụ")
        }
        
        res.render('subs/payment', {
            sub: {
                _id: subscription._id
            },
            service: {
                _id: service._id,
                name: service.name,
                price: service.price || 0,
                discount: service.discount || 0,
                logo: service.logo || subscription.logo || '/default-logo.png'
            },
            currentQuantity: subscription.quantity || 1
        })
    } catch (error) {
        console.error('Show payment error:', error)
        res.status(500).send("Lỗi hiển thị trang thanh toán")
    }
}

/* ================= FORM CREATE ================= */
exports.addPage = async (req, res) => {
    const services = await Service.find()
    return res.render('subs/create', { services })
}

/* ================= CONFIRM PAYMENT - CỘNG DỒN VÀO SUBSCRIPTION CŨ ================= */
exports.confirm = async (req, res) => {
    try {
        const { subId, quantity, voucher } = req.body
        
        // Lấy subscription pending hiện tại
        const pendingSub = await Subscription.findById(subId).populate('serviceId')
        
        if (!pendingSub || !pendingSub.serviceId) {
            return res.status(404).send("Không tìm thấy đơn hàng")
        }

        const service = pendingSub.serviceId
        
        let finalQuantity = parseInt(quantity)
        if (isNaN(finalQuantity) || finalQuantity < 1) {
            finalQuantity = 1
        }
        
        let finalVoucher = parseFloat(voucher)
        if (isNaN(finalVoucher) || finalVoucher < 0) {
            finalVoucher = 0
        }
        
        // Tính toán giá
        const unitPrice = Number(service.price || 0)
        const discountRate = Number(service.discount || 0)
        
        const basePrice = unitPrice * finalQuantity
        const discountMoney = basePrice * (discountRate / 100)
        const subtotal = basePrice - discountMoney
        let finalPrice = Math.max(0, subtotal - finalVoucher)
        
        // Tìm subscription đã thanh toán của cùng dịch vụ
        let existingSub = await Subscription.findOne({
            serviceId: service._id,
            status: 'paid'
        })
        
        if (existingSub) {
            // CỘNG DỒN vào subscription cũ
            const now = new Date()
            
            // Cộng dồn số lượng
            existingSub.quantity += finalQuantity
            
            // Cộng dồn giá
            existingSub.price += finalPrice
            
            // Cộng dồn thời gian
            let baseDate = existingSub.endDate && existingSub.endDate > now 
                ? new Date(existingSub.endDate)
                : now
            
            const addDays = finalQuantity * 30
            baseDate.setDate(baseDate.getDate() + addDays)
            existingSub.endDate = baseDate
            
            // Lưu lại lịch sử mua (tùy chọn)
            if (!existingSub.purchaseHistory) {
                existingSub.purchaseHistory = []
            }
            existingSub.purchaseHistory.push({
                quantity: finalQuantity,
                price: finalPrice,
                voucher: finalVoucher,
                purchaseDate: now
            })
            
            await existingSub.save()
            
            // Xóa subscription pending
            await Subscription.deleteOne({ _id: pendingSub._id })
            
        } else {
            // Chuyển subscription pending thành paid
            const now = new Date()
            let baseDate = pendingSub.endDate && pendingSub.endDate > now 
                ? new Date(pendingSub.endDate)
                : now
            
            const addDays = finalQuantity * 30
            baseDate.setDate(baseDate.getDate() + addDays)
            
            pendingSub.quantity = finalQuantity
            pendingSub.price = finalPrice
            pendingSub.endDate = baseDate
            pendingSub.status = 'paid'
            
            await pendingSub.save()
        }
        
        return res.redirect('/subs')
        
    } catch (error) {
        console.error('Confirm error:', error)
        return res.status(500).send("Lỗi xử lý thanh toán: " + error.message)
    }
}

/* ================= EXTEND ================= */
exports.extend = async (req, res) => {
    try {
        await subService.extend(
            req.params.id,
            Number(req.body.days)
        )
        return res.redirect('/subs')
    } catch (error) {
        console.error('Extend error:', error)
        res.status(500).send("Lỗi gia hạn")
    }
}

/* ================= DELETE ================= */
exports.delete = async (req, res) => {
    try {
        const sub = await Subscription.findById(req.params.id)
        if (!sub) {
            return res.status(404).send("Not found")
        }
        await Subscription.deleteOne({ _id: req.params.id })
        return res.redirect('/subs')
    } catch (error) {
        console.error('Delete error:', error)
        res.status(500).send("Lỗi xóa")
    }
}


// Trang chủ Dashboard mới
exports.home = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ 
            userId: req.user.id,
            status: 'paid'
        }).populate('serviceId');
        
        const now = new Date();
        
        // Xử lý từng subscription
        const services = subscriptions.map(sub => {
            let status = 'Còn hạn';
            let daysLeft = null;
            
            if (sub.endDate) {
                const diff = (new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24);
                daysLeft = Math.ceil(diff);
                
                if (diff < 0) status = 'Hết hạn';
                else if (diff <= 7) status = 'Sắp hết';
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
            };
        });
        
        // Tính tổng chi phí
        const totalCost = services.reduce((sum, s) => sum + (s.price || 0), 0);
        
        // Dịch vụ sắp hết hạn
        const expiringList = services.filter(s => s.status === 'Sắp hết');
        const expiringCount = expiringList.length;
        
        res.render('home', {
            services: services,
            totalCost: totalCost,
            expiringCount: expiringCount,
            expiringList: expiringList,
            user: req.session.user
        });
    } catch (error) {
        console.error('Home error:', error);
        res.status(500).send('Lỗi tải trang chủ');
    }
};


// Bật/tắt tự động gia hạn
// Bật/tắt tự động gia hạn
exports.toggleAutoRenew = async (req, res) => {
    try {
        const { id } = req.params
        const { enabled } = req.body
        
        console.log('Toggle auto-renew with serviceId:', { id, enabled, userId: req.user.id })
        const sub = await Subscription.findOne({
            serviceId: id,
            userId: req.user.id,
            status: 'paid'
        }).sort({ createdAt: -1 })
        
        console.log('Found subscription:', sub ? sub._id : 'NOT FOUND')
        
        if (!sub) {
            return res.status(404).json({ 
                success: false, 
                error: 'Không tìm thấy subscription' 
            })
        }
        
        sub.autoRenew = enabled
        await sub.save()
        
        return res.json({ 
            success: true, 
            autoRenew: enabled,
            message: enabled ? 'Đã bật tự động gia hạn' : 'Đã tắt tự động gia hạn' 
        })
        
    } catch (error) {
        console.error('Toggle auto-renew error:', error)
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Có lỗi xảy ra' 
        })
    }
}

// Lấy danh sách subscription có auto-renew
exports.getAutoRenewList = async (req, res) => {
    try {
        const subscriptions = await autoRenewService.getAutoRenewSubscriptions(req.user.id)
        res.json({ subscriptions })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}