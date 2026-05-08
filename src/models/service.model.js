const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    name: String,
    price: Number,
    discount: { type: Number, default: 0 },
    type: { type: String, default: '' },        // Loại dịch vụ
    packageType: { type: String, default: '' }, // Gói dịch vụ
    provider: { type: String, default: '' },    // Nhà cung cấp
    logo: String,
    description: String
})

module.exports = mongoose.model('Service', serviceSchema)