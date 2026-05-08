// Middleware kiểm tra đã đăng nhập chưa
const ensureAuth = (req, res, next) => {
    console.log('ensureAuth - Session userId:', req.session?.userId)
    
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            email: req.session.user?.email,
            name: req.session.user?.name
        }
        console.log('User authenticated:', req.user.id)
        return next()
    }
    
    console.log('User not authenticated, redirecting to login')
    res.redirect('/login')
}

// Middleware kiểm tra chưa đăng nhập
const ensureGuest = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        console.log('Guest access allowed')
        return next()
    }
    console.log('User already logged in, redirecting to subs')
    res.redirect('/subs')
}

module.exports = { ensureAuth, ensureGuest }