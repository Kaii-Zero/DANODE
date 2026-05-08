const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    name: String,
    logo: String,
    type: String,
    packageType: String,
    provider: String,
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: Number,
        default: 0
    },
    basePrice: Number,
    discountApplied: Number,
    voucherApplied: Number,
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'expired'],
        default: 'pending'
    },
    startDate: Date,
    endDate: Date,
    
    // THÊM CÁC TRƯỜNG CHO TỰ ĐỘNG GIA HẠN
    autoRenew: {
        type: Boolean,
        default: false  // Mặc định tắt
    },
    autoRenewHistory: [{
        renewedAt: Date,
        amount: Number,
        quantity: Number,
        status: String
    }],
    lastAutoRenew: Date,
    
    purchaseHistory: [{
        quantity: Number,
        price: Number,
        voucher: Number,
        purchaseDate: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Subscription', subscriptionSchema)