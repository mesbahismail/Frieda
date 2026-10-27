import { TODAY } from "./data"

const usd = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 36654 → "36,654" */
export function amount(value: number, cents = false) {
  return (cents ? usdCents : usd).format(Math.abs(value))
}

/** 36654 → "$36,654", -121.36 → "-$121.36" (cents on), signed adds "+" */
export function money(value: number, { cents = false, signed = false } = {}) {
  const sign = value < 0 ? "-" : signed && value > 0 ? "+" : ""
  return `${sign}$${amount(value, cents)}`
}

/** 19500 → "$19.5k" */
export function compact(value: number) {
  if (Math.abs(value) >= 1000) {
    const k = value / 1000
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`
  }
  return `$${value}`
}

const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthsLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function toDate(value: string | Date) {
  return typeof value === "string" ? new Date(value) : value
}

/** "21 Sep, 2024" */
export function longDate(value: string | Date) {
  const d = toDate(value)
  return `${d.getDate()} ${monthsShort[d.getMonth()]}, ${d.getFullYear()}`
}

/** "11/2/2024" */
export function shortDate(value: string | Date) {
  const d = toDate(value)
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

/** "July 2024" */
export function monthLabel(value: string | Date) {
  const d = toDate(value)
  return `${monthsLong[d.getMonth()]} ${d.getFullYear()}`
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "Today", "Yesterday" or "Fri 5 Jul, 2024" */
export function dayLabel(value: string | Date) {
  const d = toDate(value)
  if (isSameDay(d, TODAY)) return "Today"
  const yesterday = new Date(TODAY)
  yesterday.setDate(TODAY.getDate() - 1)
  if (isSameDay(d, yesterday)) return "Yesterday"
  return `${days[d.getDay()]} ${d.getDate()} ${monthsShort[d.getMonth()]}, ${d.getFullYear()}`
}

/** Groups items by a label while keeping their order. */
export function groupBy<T>(items: T[], label: (item: T) => string) {
  const groups: { label: string; items: T[] }[] = []
  for (const item of items) {
    const key = label(item)
    const last = groups[groups.length - 1]
    if (last && last.label === key) last.items.push(item)
    else groups.push({ label: key, items: [item] })
  }
  return groups
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
