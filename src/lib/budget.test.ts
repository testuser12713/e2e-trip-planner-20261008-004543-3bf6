import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Activity } from '../types'
import { CATEGORY_ORDER } from '../types'
import CategoryBar from '../components/CategoryBar'
import BudgetPage from '../pages/BudgetPage'
import { STORAGE_KEY } from '../storage'
import { TripStoreProvider } from '../store/TripStore'
import { aggregateBudget } from './budget'

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'a',
    title: 'Aktivität',
    time: '09:00',
    location: 'Ort',
    cost: 0,
    category: 'other',
    ...overrides,
  }
}

describe('aggregateBudget', () => {
  it('sums the total and every category over a mixed activity list', () => {
    const { total, perCategory } = aggregateBudget([
      makeActivity({ id: '1', cost: 120.5, category: 'travel' }),
      makeActivity({ id: '2', cost: 80, category: 'accommodation' }),
      makeActivity({ id: '3', cost: 19.9, category: 'food' }),
      makeActivity({ id: '4', cost: 50, category: 'travel' }),
    ])

    expect(total).toBeCloseTo(270.4, 2)
    expect(perCategory.travel).toBeCloseTo(170.5, 2)
    expect(perCategory.accommodation).toBeCloseTo(80, 2)
    expect(perCategory.food).toBeCloseTo(19.9, 2)
    expect(perCategory.activity).toBe(0)
    expect(perCategory.shopping).toBe(0)
    expect(perCategory.other).toBe(0)
    expect(Object.keys(perCategory).sort()).toEqual([...CATEGORY_ORDER].sort())
  })

  it('returns a total of 0 and every category at 0 for an empty list', () => {
    const { total, perCategory } = aggregateBudget([])

    expect(total).toBe(0)
    for (const category of CATEGORY_ORDER) {
      expect(perCategory[category]).toBe(0)
    }
  })

  it('treats a non-finite cost as 0', () => {
    const { total, perCategory } = aggregateBudget([
      makeActivity({ id: '1', cost: Number.NaN, category: 'food' }),
      makeActivity({ id: '2', cost: Number.POSITIVE_INFINITY, category: 'food' }),
      makeActivity({ id: '3', cost: 25, category: 'food' }),
    ])

    expect(perCategory.food).toBe(25)
    expect(total).toBe(25)
  })

  it('keeps every bar at 0 with no NaN when all costs are 0', () => {
    const { total, perCategory } = aggregateBudget([
      makeActivity({ id: '1', cost: 0, category: 'travel' }),
      makeActivity({ id: '2', cost: 0, category: 'food' }),
    ])
    const maxAmount = Math.max(0, ...CATEGORY_ORDER.map((c) => perCategory[c]))

    expect(total).toBe(0)
    expect(maxAmount).toBe(0)

    const markup = renderToStaticMarkup(
      createElement(CategoryBar, {
        category: 'food',
        amount: perCategory.food,
        maxAmount,
      }),
    )

    expect(markup).not.toContain('NaN')
    expect(markup).toContain('width:0')
  })
})

describe('BudgetPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the total and one bar per category proportional to the largest', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 't1',
          name: 'Rom',
          destination: 'Rom, Italien',
          startDate: '2025-04-14',
          endDate: '2025-04-16',
          activities: [
            makeActivity({ id: '1', cost: 200, category: 'travel' }),
            makeActivity({ id: '2', cost: 100, category: 'accommodation' }),
          ],
          packing: [],
        },
      ]),
    )

    render(
      createElement(
        MemoryRouter,
        { initialEntries: ['/trips/t1/budget'] },
        createElement(
          TripStoreProvider,
          null,
          createElement(
            Routes,
            null,
            createElement(Route, {
              path: '/trips/:tripId/budget',
              element: createElement(BudgetPage),
            }),
          ),
        ),
      ),
    )

    expect(screen.getByText('300,00')).toBeInTheDocument()

    const bars = document.querySelectorAll('.budget-chart__bar')
    expect(bars).toHaveLength(6)
    // CATEGORY_ORDER: travel is the largest (100%), accommodation half of it.
    expect(bars[0].getAttribute('style')).toContain('100%')
    expect(bars[1].getAttribute('style')).toContain('50%')
  })
})
