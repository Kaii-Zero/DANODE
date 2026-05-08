module.exports = (req, res, next) => {

    if (!req.user || req.user.role !== 'admin') {
        return res.send('Không có quyền truy cập')
    }

    next()
}