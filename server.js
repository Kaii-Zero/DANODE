require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')

const app = express()

// DB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err))

// MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

// SESSION CONFIGURATION
app.use(session({
    secret: 'your_super_secret_key_change_this_12345',
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }
}))

// Debug session middleware
app.use((req, res, next) => {
    console.log('=== SESSION DEBUG ===');
    console.log('Session ID:', req.session?.id);
    console.log('Session UserId:', req.session?.userId);
    console.log('Session User:', req.session?.user);
    console.log('Path:', req.path);
    console.log('===================');
    next();
});

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null
    res.locals.notificationCount = 0  // Thêm dòng này
    next();
})

// EJS LAYOUT
app.use(expressLayouts)
app.set('layout', 'layouts/main')

// VIEW
app.set('view engine', 'ejs')
app.set('views', './src/views')

// STATIC
app.use(express.static('./src/publics'))

// ROUTES
const mainRouter = require('./src/routes')
const subRouter = require('./src/routes/subrouter')
const dvRouter = require('./src/routes/dvrouter')
const userRouter = require('./src/routes/userrouter')

app.use('/', mainRouter)
app.use('/subs', subRouter)
app.use('/dv', dvRouter)
app.use('/', userRouter)

// Khởi động cron job tự động gia hạn
const { startAutoRenewCron } = require('./src/services/cronService')
startAutoRenewCron()

// SERVER PORT
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})