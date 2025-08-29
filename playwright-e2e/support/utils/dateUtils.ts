// --- date helper ---
export function getFutureWeekday(daysAhead = 3): string {
    const date = new Date()
    date.setDate(date.getDate() + daysAhead)

    // Skip weekends if needed
    while (date.getDay() === 0 || date.getDay() === 6) {
        date.setDate(date.getDate() + 1)
    }

    return date.toISOString().split('T')[0] // YYYY-MM-DD
}
