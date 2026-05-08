const express = require('express')
const router = express.Router()
const Service = require('../models/service.model')

// Danh sách dịch vụ (TRANG CHÍNH CỦA DV)
router.get('/', async (req, res) => {
    try {
        const services = await Service.find()
        // SỬA: render file trong thư mục dv, không phải subs
        res.render('dv/list', { services })  // ← Đổi thành dv/list
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi lấy danh sách')
    }
})

// Form thêm dịch vụ
router.get('/create', (req, res) => {
    res.render('dv/create')  // ← Giữ nguyên
})

// Xử lý thêm dịch vụ
router.post('/create', async (req, res) => {
    try {
        const { name, price, type, packageType, provider, logo, discount, description } = req.body
        
        const service = new Service({
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            type: type || '',
            packageType: packageType || 'Cơ bản',
            provider: provider || '',
            logo: logo || '',
            description: description || ''
        })
        
        await service.save()
        res.redirect('/dv')  // ← Quay lại trang danh sách dv
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi tạo dịch vụ: ' + error.message)
    }
})

// Sửa dịch vụ
router.get('/edit/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
        if (!service) {
            return res.status(404).send('Không tìm thấy dịch vụ')
        }
        res.render('dv/edit', { service })
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi lấy thông tin dịch vụ')
    }
})

router.post('/edit/:id', async (req, res) => {
    try {
        const { name, price, type, packageType, provider, logo, discount, description } = req.body
        
        await Service.findByIdAndUpdate(req.params.id, {
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            type: type || '',
            packageType: packageType || 'Cơ bản',
            provider: provider || '',
            logo: logo || '',
            description: description || ''
        })
        
        res.redirect('/dv')
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi cập nhật dịch vụ')
    }
})

// Xóa dịch vụ
router.post('/delete/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id)
        res.redirect('/dv')
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi xóa dịch vụ')
    }
})

module.exports = router