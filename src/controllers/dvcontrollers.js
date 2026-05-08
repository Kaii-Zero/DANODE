const Book = require('../models/user.model')

const Service = require('../models/service.model')

exports.list = async (req, res) => {

    const services = await Service.find()

    res.render('dv/dv', {
        services
    })
}

exports.getAll = async (req, res) => {
    try {
        const books = await Book.find()
        res.render('books/all', { books })
    } catch (err) {
        res.send(err.message)
    }
}

exports.addPage = (req, res) => {
    res.render('books/add-book')
}

exports.create = async (req, res) => {
    try {
        const { name } = req.body

        await Book.create({ name })

        res.redirect('/dv')
    } catch (err) {
        res.send(err.message)
    }
}