const Service = require('../models/service.model')

// Hiển thị form thêm dịch vụ
exports.showCreateForm = (req, res) => {
    res.render('services/create')
}

// Xử lý thêm dịch vụ
exports.createService = async (req, res) => {
    try {
        const { 
            name, 
            price, 
            type, 
            packageType,   // ← LẤY DỮ LIỆU TỪ FORM
            provider, 
            logo, 
            discount, 
            description 
        } = req.body
        
        const service = new Service({
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            type: type || '',
            packageType: packageType || 'Cơ bản',  // ← LƯU VÀO DB
            provider: provider || '',
            logo: logo || '',
            description: description || ''
        })
        
        await service.save()
        res.redirect('/dv')
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi tạo dịch vụ: ' + error.message)
    }
}

// Danh sách dịch vụ
exports.listServices = async (req, res) => {
    try {
        const services = await Service.find()
        res.render('services/list', { services })
    } catch (error) {
        console.error(error)
        res.status(500).send('Lỗi lấy danh sách')
    }
}