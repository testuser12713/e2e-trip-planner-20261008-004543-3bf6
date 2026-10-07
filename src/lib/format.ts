const currencyFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const weekdayFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long' })

/**
 * Amount as '1.234,50' — de-DE, two decimals, no currency symbol.
 * Non-finite input falls back to '0,00'.
 */
export function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return currencyFormatter.format(0)
  return currencyFormatter.format(n)
}

function parseIso(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** ISO 'YYYY-MM-DD' as German 'TT.MM.JJJJ'. Invalid input is returned as-is. */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  return `${match[3]}.${match[2]}.${match[1]}`
}

/** Full German weekday name for an ISO date, e.g. 'Montag'. */
export function formatWeekday(iso: string): string {
  const date = parseIso(iso)
  if (!date) return ''
  const name = weekdayFormatter.format(date)
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Every date between start and end (inclusive, ascending) as ISO strings.
 * Returns an empty array for invalid input or when end is before start.
 */
export function eachDateInRange(start: string, end: string): string[] {
  const startDate = parseIso(start)
  const endDate = parseIso(end)
  if (!startDate || !endDate) return []
  if (endDate.getTime() < startDate.getTime()) return []

  const dates: string[] = []
  const cursor = new Date(startDate.getTime())
  // Safety valve: never loop without bound on a malformed range.
  for (let i = 0; i < 3660; i += 1) {
    dates.push(
      `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(
        cursor.getDate(),
      )}`,
    )
    if (
      cursor.getFullYear() === endDate.getFullYear() &&
      cursor.getMonth() === endDate.getMonth() &&
      cursor.getDate() === endDate.getDate()
    ) {
      break
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}
