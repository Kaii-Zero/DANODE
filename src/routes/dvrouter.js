const router = require('express').Router()

const Service = require('../models/service.model')

const auth = require('../helpers/auth')
const admin = require('../helpers/admin')

router.use(auth)


// LIST
router.get('/', async (req, res) => {

    const services = await Service.find()

    res.render('dv/dv', {
        services,
        user: req.user
    })
})


// CREATE FORM
router.get('/create', admin, (req, res) => {

    res.render('dv/create')

})


// CREATE HANDLE
router.post('/create', admin, async (req, res) => {

    await Service.create({
        name: req.body.name,
        price: req.body.price,
        type: req.body.type,
        discount: req.body.discount,
        package: req.body.package,
        provider: req.body.provider,
        logo: req.body.logo,
        description: req.body.description
    })

    res.redirect('/dv')

})


// EDIT FORM
router.get('/edit/:id', admin, async (req, res) => {

    const service = await Service.findById(req.params.id)

    res.render('dv/edit', { service })

})


// UPDATE
router.post('/edit/:id', async (req, res) => {

    await Service.findByIdAndUpdate(
        req.params.id,
        req.body
    )

    res.redirect('/dv')

})


// DELETE
router.get('/delete/:id', admin, async (req, res) => {

    await Service.findByIdAndDelete(req.params.id)

    res.redirect('/dv')

})

// PAYMENT
router.get('/payment/:id', async (req, res) => {

    const sub = await Subscription.findById(req.params.id)

    res.render('subs/payment', {
        sub
    })

})


module.exports = router