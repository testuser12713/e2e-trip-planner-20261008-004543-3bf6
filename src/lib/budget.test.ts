import { describe, expect, it } from 'vitest'
import { aggregateBudget } from './budget'
import { CATEGORY_ORDER, type Activity, type Category } from '../types'

function makeActivity(cost: number, category: Category): Activity {
  return {
    id: `activity-${category}-${cost}`,
    title: 'Beispiel',
    time: '09:00',
    location: 'Vor Ort',
    cost,
    category,
  }
}

describe('aggregateBudget', () => {
  it('returns total 0 and every category present at 0 for an empty list', () => {
    const { total, perCategory } = aggregateBudget([])

    expect(total).toBe(0)
    for (const category of CATEGORY_ORDER) {
      expect(perCategory[category]).toBe(0)
    }
    expect(Object.keys(perCategory)).toHaveLength(CATEGORY_ORDER.length)
  })

  it('sums all activity costs into the total', () => {
    const { total } = aggregateBudget([
      makeActivity(100, 'travel'),
      makeActivity(50.5, 'food'),
      makeActivity(9.5, 'other'),
    ])

    expect(total).toBeCloseTo(160, 5)
  })

  it('sums each category separately and keeps every category present', () => {
    const { perCategory } = aggregateBudget([
      makeActivity(100, 'travel'),
      makeActivity(30, 'travel'),
      makeActivity(20, 'food'),
    ])

    expect(perCategory.travel).toBeCloseTo(130, 5)
    expect(perCategory.food).toBeCloseTo(20, 5)
    expect(perCategory.accommodation).toBe(0)
    expect(perCategory.activity).toBe(0)
    expect(perCategory.shopping).toBe(0)
    expect(perCategory.other).toBe(0)
  })

  it('ignores a non-finite cost instead of producing NaN', () => {
    const { total, perCategory } = aggregateBudget([
      makeActivity(Number.NaN, 'food'),
      makeActivity(40, 'food'),
    ])

    expect(Number.isFinite(total)).toBe(true)
    expect(total).toBeCloseTo(40, 5)
    expect(perCategory.food).toBeCloseTo(40, 5)
  })
})
