const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

module.exports = connectDB

// mongodb+srv://admin:0Aky09dpqi1v8RQO@cluster0.xdrb2rt.mongodb.net/?appName=Cluster0