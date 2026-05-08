const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    serviceId: {
        type: String,
        required: true
    },

    name: String,
    price: Number,
    type: String,
    provider: String,
    logo: String,
    endDate: Date,

    status: {
        type: String,
        default: 'pending' // pending | paid | expired
    },

    startDate: {
        type: Date,
        default: Date.now
    },
    quantity: {
        type: Number,
        default: 1
    },

    endDate: Date
})

module.exports = mongoose.model('Subscription', subscriptionSchema)