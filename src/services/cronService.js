const Subscription = require('../models/subscription.model')

setInterval(async () => {

    const now = new Date()

    await Subscription.updateMany(
        { endDate: { $lt: now } },
        { status: 'expired' }
    )

}, 60 * 60 * 1000) // 1 giờ chạy 1 lần