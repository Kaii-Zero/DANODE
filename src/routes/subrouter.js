const router = require('express').Router()

const subController = require('../controllers/subcontrollers')
const auth = require('../helpers/auth')
const Subscription = require('../models/subscription.model')
router.use(auth)

// CREATE
router.get('/create', subController.addPage)
router.post('/create', subController.create)

// PAYMENT FLOW
router.post('/confirm', subController.confirm)

// DASHBOARD
router.get('/', subController.list)

// EXTEND
router.post('/extend/:id', subController.extend)

// DELETE
router.get('/delete/:id', subController.delete)

// PAY
router.get('/payment/:id', async (req, res) => {

    const sub = await Subscription.findById(req.params.id)
        .populate('serviceId')

    if (!sub) return res.send("Not found")

    return res.render('subs/payment', {
        sub,
        service: sub.serviceId   // 👈 BẮT BUỘC
    })
})

module.exports = router