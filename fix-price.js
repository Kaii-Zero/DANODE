// Tạo file fix-price.js
const mongoose = require('mongoose');
require('dotenv').config();

const fixPrice = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = mongoose.connection;
        const services = db.collection('services');
        
        // Cập nhật Netflix: price = 27 (giá sau giảm), discount = 10
        await services.updateOne(
            { name: "Netflix Premium" },
            { 
                $set: { 
                    price: 27,           // Giá sau giảm
                    discount: 10,        // Giảm 10%
                    originalPrice: 30    // Giá gốc (tùy chọn)
                } 
            }
        );
        
        // Cập nhật các service khác nếu cần
        console.log('✅ Updated prices successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixPrice();