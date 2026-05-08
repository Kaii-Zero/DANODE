const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        default: 0
    },

    cycle: {
        type: String, // monthly, yearly...
        default: 'monthly'
    },

    renewalDate: {
        type: Date
    },

    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    }
}, { timestamps: true })

module.exports = mongoose.model('Subscription', subscriptionSchema)