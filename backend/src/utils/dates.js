export function toDateString(value) {
  if (!value) return null
  if (typeof value === 'string') return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

export function parseDate(value) {
  if (!value) return null
  const text = typeof value === 'string' ? value.slice(0, 10) : toDateString(value)
  const date = new Date(`${text}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function todayUtc() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export function addMonthsUtc(date, months) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()))
}

export function formatDueLabel(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatMonthLabel(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function isSameUtcMonth(a, b) {
  const left = new Date(a)
  const right = new Date(b)
  return left.getUTCFullYear() === right.getUTCFullYear() && left.getUTCMonth() === right.getUTCMonth()
}

export function computeContractStatus(startDate, endDate, stored) {
  const today = todayUtc()
  const end = new Date(endDate)
  if (end < today) return 'expired'
  const soon = addMonthsUtc(today, 0)
  soon.setUTCDate(soon.getUTCDate() + 45)
  if (end <= soon) return 'ending soon'
  return stored || 'active'
}

export function parseId(value) {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

export function asNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function asStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter(Boolean)
}
