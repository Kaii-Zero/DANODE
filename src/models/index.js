const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'database.json')

const readDB = () => {
    const data = fs.readFileSync(filePath)
    return JSON.parse(data)
}

const writeDB = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

module.exports = {
    readDB,
    writeDB
}