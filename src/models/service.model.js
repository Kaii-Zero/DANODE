// const mongoose = require('mongoose')

// const serviceSchema = new mongoose.Schema({

//     name: {
//         type: String,
//         required: true
//     },

//     price: {
//         type: Number,
//         required: true
//     },

//     type: {
//         type: String
//     },

//     promotion: {
//         type: String
//     },

//     packageType: {
//         type: String,
//         enum: ['Thường', 'VIP'],
//         default: 'Thường'
//     },

//     provider: {
//         type: String
//     },

//     logo: {
//         type: String
//     }

// }, {
//     timestamps: true
// })

// module.exports = mongoose.model('Service', serviceSchema)

const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({

    name: String,
    price: Number,
    type: String,
    discount: Number,
    package: String,
    provider: String,
    logo: String,
    description: String

}, {
    timestamps: true
})

module.exports = mongoose.model('Service', serviceSchema)