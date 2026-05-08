const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    const token = req.cookies.token

    // Không có token
    if (!token) {
        return res.redirect('/login')
    }

    try {

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        // Lưu user vào request
        req.user = decoded

        next()

    } catch (err) {

        // Token sai hoặc hết hạn
        return res.redirect('/login')
    }
}