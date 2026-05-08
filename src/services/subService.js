const Subscription = require('../models/subscription.model')

exports.getAll = async (query) => {
    const keyword = query.keyword || ''

    return Subscription.find({
        name: { $regex: keyword, $options: 'i' }
    }).sort({ createdAt: -1 })
}

exports.create = async (data) => {
    return Subscription.create(data)
}

exports.extend = async (id, days) => {
    const sub = await Subscription.findById(id)
    if (!sub) throw new Error('Not found')

    sub.endDate = new Date(sub.endDate.getTime() + days * 86400000)

    return sub.save()
}

exports.delete = async (id) => {
    return Subscription.findByIdAndDelete(id)
}