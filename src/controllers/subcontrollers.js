const Service = require('../models/service.model')
const Subscription = require('../models/subscription.model')
const subService = require('../services/subService')


/* ================= LIST (DASHBOARD) ================= */
exports.list = async (req, res) => {

    const subs = await Subscription.find({
        userId: req.user.id
    })

    const now = new Date()

    const data = subs.map(sub => {

    let status = 'Còn hạn'
    let daysLeft = null

    // 🔥 THÊM DÒNG NÀY
    let quantityFromDays = 1

    if (sub.endDate) {

        const diff = (new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24)

        daysLeft = Math.ceil(diff)

        // 🔥 THÊM LOGIC QUANTITY Ở ĐÂY
        quantityFromDays = Math.ceil(Math.max(diff, 0) / 30)

        if (diff < 0) status = 'Hết hạn'
        else if (diff <= 7) status = 'Sắp hết'
    }

    return {
        ...sub._doc,
        status,
        daysLeft,

        // GÁN RA VIEW
        quantity: quantityFromDays
    }
})
    const totalServices = subs.length
    const totalCost = subs.reduce((sum, s) => sum + (s.price || 0), 0)
    const totalQuantity = data.reduce((sum, s) => {
    return sum + (s.quantity || 1)
}, 0)

    const expiringList = data.filter(sub => {

        if (!sub.endDate) return false

        const diffDays =
            (new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24)

        return diffDays <= 30 && diffDays > 0
    })

    const expiringSoon = expiringList.length

    return res.render('subs/dashboard', {
        subs: data,
        totalServices,
        totalCost,
        expiringSoon,
        expiringList,
        totalQuantity
    })
}

/* ================= FORM CREATE ================= */
exports.addPage = async (req, res) => {

    const services = await Service.find()

    return res.render('subs/create', {
        services
    })
}

/* ================= CREATE (CHUYỂN SANG PAYMENT) ================= */
exports.create = async (req, res) => {

    const service = await Service.findById(req.body.serviceId)
    if (!service) return res.send("Service not found")

    let quantity = Number(req.body.quantity)

if (isNaN(quantity) || quantity < 1) {
    quantity = 1
}

if (isNaN(quantity) || quantity < 1) {
    return res.status(400).send("Invalid quantity")
}

    const existing = await Subscription.findOne({
        userId: req.user.id,
        serviceId: service._id
    })

    // ======================
    // EXTEND + CỘNG DỒN
    // ======================
    if (existing) {

        const now = new Date()

        // base ngày hiện tại (nếu còn hạn thì lấy endDate)
        let baseDate = existing.endDate && existing.endDate > now
            ? new Date(existing.endDate)
            : now

        // 👉 cộng ngày theo số lượng
        baseDate.setDate(baseDate.getDate() + (30 * quantity))

        // 👉 CỘNG quantity (không ghi đè)
        existing.quantity = quantity

        // 👉 giá = giá cũ + giá mới
        const newTotalPrice = service.price * quantity
        existing.price = (existing.price || 0) + newTotalPrice

        existing.endDate = baseDate
        existing.status = 'pending'

        await existing.save()

        return res.redirect(`/subs/payment/${existing._id}`)
    }

    // ======================
    // CREATE NEW
    // ======================
    const sub = await Subscription.create({

        userId: req.user.id,
        serviceId: service._id,

        name: service.name,
        logo: service.logo,
        type: service.type,
        provider: service.provider,

        quantity: quantity,

        price: service.price * quantity,

        status: 'pending',

        // 👉 nếu muốn tính luôn ngày:
        startDate: new Date(),
        endDate: new Date(Date.now() + (30 * quantity * 24 * 60 * 60 * 1000))
    })

    return res.redirect(`/subs/payment/${sub._id}`)
}
/* ================= EXTEND (OPTIONAL SERVICE) ================= */
exports.extend = async (req, res) => {

    await subService.extend(
        req.params.id,
        Number(req.body.days)
    )

    return res.redirect('/subs')
}

/* ================= DELETE ================= */
exports.delete = async (req, res) => {

    const sub = await Subscription.findById(req.params.id)

    if (!sub) {
        return res.status(404).send("Not found")
    }

    await Subscription.deleteOne({ _id: req.params.id })

    return res.redirect('/subs')
}

// CONFIRM
exports.confirm = async (req, res) => {

    const sub = await Subscription.findById(req.body.subId)
        .populate('serviceId')

    if (!sub || !sub.serviceId) {
        return res.status(404).send("Subscription not found")
    }

    const service = sub.serviceId

    // =========================
    // CHỐNG +1 SAI (QUAN TRỌNG)
    // =========================
    const quantity = Math.max(1, parseInt(req.body.quantity || 1))

    const voucher = Math.max(0, Number(req.body.voucher || 0))

    const unitPrice = Number(service.price || 0)
    const discountRate = Number(service.discount || 0)

    // =========================
    // GIÁ CHUẨN
    // =========================
    const basePrice = unitPrice * quantity
    const discountMoney = basePrice * (discountRate / 100)

    let finalPrice = basePrice - discountMoney - voucher

    if (isNaN(finalPrice)) finalPrice = 0

    // =========================
    // FIX QUANTITY KHÔNG CỘNG DỒN SAI
    // =========================
    sub.quantity = quantity   // ❌ KHÔNG + existing nữa

    sub.price = finalPrice

    // =========================
    // FIX NGÀY
    // =========================
    const addDays = quantity * 30

    let baseDate = sub.endDate && sub.endDate > new Date()
        ? new Date(sub.endDate)
        : new Date()

    baseDate.setDate(baseDate.getDate() + addDays)

    sub.endDate = baseDate
    sub.status = 'paid'

    await sub.save()

    return res.redirect('/subs')
}