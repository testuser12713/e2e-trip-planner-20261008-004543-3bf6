import { beforeEach, describe, expect, it } from 'vitest'
import type { Trip } from './types'
import {
  STORAGE_KEY,
  STORAGE_NAMESPACE,
  STORAGE_VERSION,
  loadTrips,
  saveTrips,
} from './storage'

const trip: Trip = {
  id: 't1',
  name: 'Rom',
  destination: 'Italien',
  startDate: '2025-04-14',
  endDate: '2025-04-18',
  activities: [],
  packing: [],
}

describe('storage key', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('joins the namespace and version into the runtime key', () => {
    expect(STORAGE_NAMESPACE).not.toContain('.')
    expect(STORAGE_VERSION).toBe('v1')
    expect(STORAGE_KEY).toBe(`${STORAGE_NAMESPACE}.${STORAGE_VERSION}`)
  })

  it('round-trips the full trip state through the single key', () => {
    saveTrips([trip])
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(loadTrips()).toEqual([trip])
  })

  it('rehydrates an empty list when nothing is stored', () => {
    expect(loadTrips()).toEqual([])
  })
})
