// // require('dotenv').config()

// // const express = require('express')
// // const morgan = require('morgan')
// // const cookieParser = require('cookie-parser')

// // const connectDB = require('./src/config/db')

// // const app = express()

// // // CONNECT DB
// // connectDB()

// // // MIDDLEWARE
// // app.use(express.json())
// // app.use(express.urlencoded({ extended: true }))
// // app.use(cookieParser())
// // app.use(morgan('dev'))

// // // VIEW ENGINE
// // app.set('view engine', 'ejs')
// // app.set('views', './src/views')

// // // STATIC
// // app.use(express.static('./src/publics'))

// // // ROUTES
// // app.use('/', require('./src/routes'))

// // // SERVER
// // const PORT = process.env.PORT || 3000

// // app.listen(PORT, () => {
// //     console.log(`Server running at http://localhost:${PORT}`)
// // })

// require('dotenv').config()

// const express = require('express')
// const mongoose = require('mongoose')
// const cookieParser = require('cookie-parser')
// const morgan = require('morgan')
// const expressLayouts = require('express-ejs-layouts')

// const app = express()

// // CONNECT MONGODB
// mongoose.connect(process.env.MONGO_URI)
// .then(() => {
//     console.log('MongoDB connected')
// })
// .catch(err => {
//     console.log(err)
// })

// // MIDDLEWARE
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(cookieParser())
// app.use(morgan('dev'))
// app.use(expressLayouts)
// app.set('layout', 'layouts/main')


// // VIEW ENGINE
// app.set('view engine', 'ejs')
// app.set('views', './src/views')

// // STATIC FILES
// app.use(express.static('./src/publics'))

// // ROUTES
// app.use('/', require('./src/routes'))
// // app.use('/subs', require('./src/routes/subrouter'))

// // SERVER
// const PORT = process.env.PORT || 3000

// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`)
// })

// const dvRouter = require('./src/routes/dvrouter')

// app.use('/dv', dvRouter)



require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const expressLayouts = require('express-ejs-layouts')

const app = express()

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err))

// ================= MIDDLEWARE =================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

// ================= EJS LAYOUT =================
app.use(expressLayouts)
app.set('layout', 'layouts/main')

// ================= VIEW =================
app.set('view engine', 'ejs')
app.set('views', './src/views')

// ================= STATIC =================
app.use(express.static('./src/publics'))

// ================= ROUTES =================
const mainRouter = require('./src/routes')
const subRouter = require('./src/routes/subrouter')
const dvRouter = require('./src/routes/dvrouter')

// 👉 QUAN TRỌNG: mount rõ ràng
app.use('/', mainRouter)
app.use('/subs', subRouter)
app.use('/dv', dvRouter)

// ================= SERVER =================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})