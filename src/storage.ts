import type { Trip } from './types'

/** The single localStorage key for the whole app state (AC-02). */
export const STORAGE_KEY = 'trip-planner.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Rehydrates the full trip list from localStorage. Any malformed or partial
 * payload is discarded rather than allowed to crash the app at boot.
 */
export function loadTrips(): Trip[] {
  if (typeof localStorage === 'undefined') return []
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isTrip).map(normalizeTrip)
  } catch {
    return []
  }
}

/** Writes the full state to the single localStorage key. */
export function saveTrips(trips: Trip[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
  } catch {
    // Storage can be full or unavailable (private mode). The app stays usable.
  }
}

function isTrip(value: unknown): value is Trip {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.destination === 'string' &&
    typeof value.startDate === 'string' &&
    typeof value.endDate === 'string'
  )
}

function normalizeTrip(value: Trip): Trip {
  return {
    id: value.id,
    name: value.name,
    destination: value.destination,
    startDate: value.startDate,
    endDate: value.endDate,
    activities: Array.isArray(value.activities) ? value.activities : [],
    packing: Array.isArray(value.packing) ? value.packing : [],
  }
}
