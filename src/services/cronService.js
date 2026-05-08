const cron = require('node-cron')
const { checkAndAutoRenew } = require('./autoRenewService')

// Chạy mỗi ngày lúc 00:00 (nửa đêm)
const startAutoRenewCron = () => {
    // Chạy mỗi ngày lúc 0 giờ
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Đang chạy kiểm tra tự động gia hạn...', new Date().toISOString())
        await checkAndAutoRenew()
        console.log('✅ Hoàn thành kiểm tra tự động gia hạn')
    })
    
    // Chạy thêm lúc 12:00 trưa để đảm bảo
    cron.schedule('0 12 * * *', async () => {
        console.log('🔄 Chạy kiểm tra bổ sung...', new Date().toISOString())
        await checkAndAutoRenew()
    })
    
    console.log('✅ Cron job tự động gia hạn đã được khởi động')
}

module.exports = { startAutoRenewCron }