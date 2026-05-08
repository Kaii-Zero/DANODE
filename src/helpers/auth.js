// // const jwt = require('jsonwebtoken')

// // module.exports = (req, res, next) => {

// //     console.log('COOKIE:', req.cookies)

// //     const token = req.cookies.token

// //     console.log('TOKEN:', token)

// //     if (!token) {

// //         console.log('KHÔNG CÓ TOKEN')

// //         return res.redirect('/login')
// //     }

// //     try {

// //         const decoded = jwt.verify(
// //             token,
// //             process.env.JWT_SECRET
// //         )

// //         console.log('TOKEN OK')

// //         req.user = decoded

// //         next()

// //     } catch (err) {

// //         console.log('JWT ERROR:', err.message)

// //         return res.redirect('/login')
// //     }
// // }

// const jwt = require('jsonwebtoken')

// module.exports = (req, res, next) => {

//     const token = req.cookies.token

//     if (!token) {
//         return res.redirect('/login')
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)
//         req.user = decoded
//         next()

//     } catch (err) {

//         return res.redirect('/login')
//     }
// }

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