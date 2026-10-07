import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Activity } from '../types'
import { CATEGORY_ORDER } from '../types'
import { aggregateBudget } from './budget'
import CategoryBar from '../components/CategoryBar'
import BudgetPage from '../pages/BudgetPage'
import { TripStoreProvider } from '../store/TripStore'
import { STORAGE_KEY } from '../storage'

function activity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'a1',
    title: 'Test',
    time: '12:00',
    location: 'Ort',
    cost: 0,
    category: 'other',
    ...overrides,
  }
}

describe('aggregateBudget', () => {
  it('sums the total and every category over a mixed activity list', () => {
    const activities = [
      activity({ id: '1', cost: 100, category: 'travel' }),
      activity({ id: '2', cost: 50.5, category: 'accommodation' }),
      activity({ id: '3', cost: 25, category: 'travel' }),
      activity({ id: '4', cost: 10, category: 'food' }),
      activity({ id: '5', cost: 5, category: 'activity' }),
      activity({ id: '6', cost: 2, category: 'shopping' }),
    ]

    const { total, perCategory } = aggregateBudget(activities)

    expect(total).toBeCloseTo(192.5, 5)
    expect(perCategory.travel).toBeCloseTo(125, 5)
    expect(perCategory.accommodation).toBeCloseTo(50.5, 5)
    expect(perCategory.food).toBeCloseTo(10, 5)
    expect(perCategory.activity).toBeCloseTo(5, 5)
    expect(perCategory.shopping).toBeCloseTo(2, 5)
    expect(perCategory.other).toBe(0)

    // All six categories are always present, even the unused ones.
    expect(Object.keys(perCategory).sort()).toEqual([...CATEGORY_ORDER].sort())
    for (const category of CATEGORY_ORDER) {
      expect(perCategory[category]).toBeTypeOf('number')
    }
  })

  it('returns total 0 and all six categories at 0 for an empty list', () => {
    const { total, perCategory } = aggregateBudget([])

    expect(total).toBe(0)
    for (const category of CATEGORY_ORDER) {
      expect(perCategory[category]).toBe(0)
    }
  })

  it('counts non-finite costs as 0 instead of propagating NaN', () => {
    const activities = [
      activity({ id: '1', cost: Number.NaN, category: 'travel' }),
      activity({ id: '2', cost: Number.POSITIVE_INFINITY, category: 'food' }),
      activity({ id: '3', cost: 20, category: 'food' }),
    ]

    const { total, perCategory } = aggregateBudget(activities)

    expect(total).toBe(20)
    expect(perCategory.travel).toBe(0)
    expect(perCategory.food).toBe(20)
    expect(Number.isNaN(perCategory.travel)).toBe(false)
  })
})

describe('CategoryBar', () => {
  it('keeps every bar at 0% without NaN or division by zero when the maximum is 0', () => {
    const { container } = render(
      createElement(
        'div',
        null,
        CATEGORY_ORDER.map((category) =>
          createElement(CategoryBar, {
            key: category,
            category,
            amount: 0,
            maxAmount: 0,
          }),
        ),
      ),
    )

    const bars = container.querySelectorAll<HTMLElement>('.budget-chart-bar')
    expect(bars).toHaveLength(6)
    bars.forEach((bar) => {
      expect(bar.style.width).toBe('0%')
      expect(bar.style.width).not.toMatch(/NaN/)
    })
  })

  it('scales a bar to its share of the largest category and prints the amount', () => {
    const full = render(
      createElement(CategoryBar, {
        category: 'accommodation',
        amount: 780,
        maxAmount: 780,
      }),
    )

    expect(
      full.container.querySelector<HTMLElement>('.budget-chart-bar')?.style.width,
    ).toBe('100%')
    expect(full.container.textContent).toContain('Unterkunft')
    expect(full.container.textContent).toContain('780,00')
    expect(full.container.textContent).not.toContain('€')

    const half = render(
      createElement(CategoryBar, {
        category: 'travel',
        amount: 50,
        maxAmount: 100,
      }),
    )

    expect(
      half.container.querySelector<HTMLElement>('.budget-chart-bar')?.style.width,
    ).toBe('50%')
  })
})

const TRIP = {
  id: 't1',
  name: 'Sommerurlaub Italien',
  destination: 'Rom, Italien',
  startDate: '2025-04-14',
  endDate: '2025-04-16',
  activities: [
    activity({
      id: 'a1',
      title: 'Flug',
      cost: 300,
      category: 'travel',
    }),
    activity({
      id: 'a2',
      title: 'Hotel',
      cost: 150,
      category: 'accommodation',
    }),
  ],
  packing: [],
}

function renderBudgetPage(path = '/trips/t1/budget') {
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
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
}

describe('BudgetPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the total and one proportional bar per category', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([TRIP]))
    const { container } = renderBudgetPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Budget' }),
    ).toBeInTheDocument()
    expect(container.querySelector('.budget-total')?.textContent).toBe('450,00')

    const bars = container.querySelectorAll<HTMLElement>('.budget-chart-bar')
    expect(bars).toHaveLength(6)
    expect(
      container.querySelector<HTMLElement>(
        '.budget-chart-bar[data-category="travel"]',
      )?.style.width,
    ).toBe('100%')
    expect(
      container.querySelector<HTMLElement>(
        '.budget-chart-bar[data-category="accommodation"]',
      )?.style.width,
    ).toBe('50%')
  })

  it('shows the empty note and 0% bars for an all-zero budget', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...TRIP, activities: [] }]))
    const { container } = renderBudgetPage()

    expect(container.querySelector('.budget-total')?.textContent).toBe('0,00')
    expect(
      screen.getByText('Für diese Reise sind noch keine Kosten erfasst.'),
    ).toBeInTheDocument()
    container
      .querySelectorAll<HTMLElement>('.budget-chart-bar')
      .forEach((bar) => expect(bar.style.width).toBe('0%'))
  })

  it('renders an explicit message with the back link for an unknown trip', () => {
    localStorage.clear()
    renderBudgetPage('/trips/missing/budget')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Budget' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/nicht gefunden/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Alle Reisen' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
