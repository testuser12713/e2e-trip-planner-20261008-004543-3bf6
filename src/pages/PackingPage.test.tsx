import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import PackingPage from './PackingPage'
import { TripStoreProvider } from '../store/TripStore'
import { STORAGE_KEY } from '../storage'
import type { Trip } from '../types'

const TRIP_ID = 'trip-1'

function seedTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: TRIP_ID,
    name: 'Sommerurlaub Italien',
    destination: 'Rom, Italien',
    startDate: '2025-04-14',
    endDate: '2025-04-20',
    activities: [],
    packing: [],
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/trips/${TRIP_ID}/packing`]}>
      <TripStoreProvider>
        <Routes>
          <Route path="/trips/:tripId/packing" element={<PackingPage />} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

function seed(trip: Trip) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([trip]))
}

describe('PackingPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the empty state and a zero counter with no items', () => {
    seed(seedTrip())
    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Packliste' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
    expect(screen.getByText('Noch nichts auf der Packliste')).toBeInTheDocument()
  })

  it('adds an item and updates the counter', async () => {
    const user = userEvent.setup()
    seed(seedTrip())
    renderPage()

    await user.type(screen.getByLabelText('Gegenstand'), 'Reisepass')
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))

    expect(screen.getByText('Reisepass')).toBeInTheDocument()
    expect(screen.getByText('0 von 1 gepackt')).toBeInTheDocument()
    expect(screen.getByLabelText('Gegenstand')).toHaveValue('')
  })

  it('toggles an item, updates the counter and marks it as packed', async () => {
    const user = userEvent.setup()
    seed(
      seedTrip({
        packing: [{ id: 'p1', label: 'Reisepass', packed: false }],
      }),
    )
    renderPage()

    const checkbox = screen.getByRole('checkbox', { name: 'Reisepass' })
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getByText('1 von 1 gepackt')).toBeInTheDocument()
    expect(screen.getByText('Reisepass').closest('.packing-item')).toHaveClass(
      'packing-item--checked',
    )
  })

  it('deletes an item and keeps the remaining ones', async () => {
    const user = userEvent.setup()
    seed(
      seedTrip({
        packing: [
          { id: 'p1', label: 'Reisepass', packed: false },
          { id: 'p2', label: 'Badesachen', packed: false },
        ],
      }),
    )
    renderPage()

    await user.click(screen.getAllByRole('button', { name: 'Löschen' })[0])

    expect(screen.queryByText('Reisepass')).not.toBeInTheDocument()
    expect(screen.getByText('Badesachen')).toBeInTheDocument()
    expect(screen.getByText('0 von 1 gepackt')).toBeInTheDocument()
  })

  it('shows the empty item error only after a submit attempt', async () => {
    const user = userEvent.setup()
    seed(seedTrip())
    renderPage()

    expect(
      screen.queryByText('Bitte einen Gegenstand eingeben.'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))

    expect(
      screen.getByText('Bitte einen Gegenstand eingeben.'),
    ).toBeInTheDocument()
  })

  it('persists adding and toggling across a reload', async () => {
    const user = userEvent.setup()
    seed(seedTrip())
    const { unmount } = renderPage()

    await user.type(screen.getByLabelText('Gegenstand'), 'Reisepass')
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    await user.click(screen.getByRole('checkbox', { name: 'Reisepass' }))
    expect(screen.getByText('1 von 1 gepackt')).toBeInTheDocument()

    unmount()

    // A fresh provider rehydrates from localStorage, like a page reload.
    renderPage()
    expect(screen.getByText('1 von 1 gepackt')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Reisepass' })).toBeChecked()
  })
})
