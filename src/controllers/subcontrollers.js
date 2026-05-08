// const subService = require('../services/subService')

// exports.list = async (req, res) => {

//     const subs = await subService.getAll(req.query)

//     const now = new Date()

//     const data = subs.map(sub => {

//         let status = 'Còn hạn'

//         if (sub.endDate && new Date(sub.endDate) < now) {
//             status = 'Hết hạn'
//         }
//         else if (
//             sub.endDate &&
//             (new Date(sub.endDate) - now) / 86400000 <= 7
//         ) {
//             status = 'Sắp hết'
//         }

//         return {
//             ...sub._doc,
//             status
//         }
//     })

//     res.render('books/all', {
//         books: data   // 👈 GIỮ NGUYÊN để khớp EJS
//     })
// }

// exports.addPage = (req, res) => {
//     res.render('books/add-book')
// }

// exports.create = async (req, res) => {
//     await subService.create(req.body)
//     res.redirect('/subs')
// }

// exports.extend = async (req, res) => {
//     await subService.extend(
//         req.params.id,
//         Number(req.body.days)
//     )

//     res.redirect('/subs')
// }

// exports.delete = async (req, res) => {
//     await subService.delete(req.params.id)
//     res.redirect('/subs')
// }

const Service = require('../models/service.model')
const subService = require('../services/subService')

// ================= LIST SUBS =================
exports.list = async (req, res) => {

    const subs = await subService.getAll(req.query)

    const now = new Date()

    const data = subs.map(sub => {

        let status = 'Còn hạn'

        if (sub.endDate && new Date(sub.endDate) < now) {
            status = 'Hết hạn'
        }
        else if (
            sub.endDate &&
            (new Date(sub.endDate) - now) / 86400000 <= 7
        ) {
            status = 'Sắp hết'
        }

        return {
            ...sub._doc,
            status
        }
    })

    res.render('books/all', {
        books: data
    })
}


// ================= FORM CREATE SUB =================
exports.addPage = async (req, res) => {

    const services = await Service.find()

    res.render('subs/create', {
        services
    })

}


// ================= CREATE SUB =================
exports.create = async (req, res) => {

    await subService.create(req.body)

    res.redirect('/subs/create')

}


// ================= EXTEND =================
exports.extend = async (req, res) => {

    await subService.extend(
        req.params.id,
        Number(req.body.days)
    )

    res.redirect('/subs')

}


// ================= DELETE =================
exports.delete = async (req, res) => {

    await subService.delete(req.params.id)

    res.redirect('/subs')

}