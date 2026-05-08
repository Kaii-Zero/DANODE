const router = require('express').Router()

const subController = require('../controllers/subcontrollers')
const auth = require('../helpers/auth')

console.log(subController) // debug

router.use(auth)

router.get('/', subController.list)

router.get('/create', subController.addPage)

router.post('/create', subController.create)

router.post('/extend/:id', subController.extend)

router.get('/delete/:id', subController.delete)

module.exports = router