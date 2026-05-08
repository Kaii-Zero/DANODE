exports.isNear = (date) => {

    const today = new Date()

    const diff = (new Date(date) - today) / (1000 * 60 * 60 * 24)

    return diff <= 3
}