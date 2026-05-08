exports.monthlyCost = (subs) => {

    let total = 0

    subs.forEach(s => {
        if (s.cycle === 'month') total += s.price
        if (s.cycle === 'year') total += s.price / 12
    })

    return total
}