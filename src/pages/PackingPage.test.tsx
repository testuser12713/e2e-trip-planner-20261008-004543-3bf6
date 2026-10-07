import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import PackingPage from './PackingPage'
import { TripStoreProvider } from '../store/TripStore'
import { STORAGE_KEY } from '../storage'
import type { Trip } from '../types'

const EMPTY_TRIP: Trip = {
  id: 't1',
  name: 'Sommerurlaub Italien',
  destination: 'Rom, Italien',
  startDate: '2025-04-14',
  endDate: '2025-04-18',
  activities: [],
  packing: [],
}

function seed(trip: Trip) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([trip]))
}

function renderPage(tripId = 't1') {
  return render(
    <MemoryRouter initialEntries={[`/trips/${tripId}/packing`]}>
      <TripStoreProvider>
        <Routes>
          <Route path="/trips/:tripId/packing" element={<PackingPage />} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

describe('PackingPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the empty state and no error on an untouched form', () => {
    seed(EMPTY_TRIP)
    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Packliste' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
    expect(
      screen.getByText('Noch nichts auf der Packliste'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Bitte einen Gegenstand eingeben.'),
    ).not.toBeInTheDocument()
  })

  it('renders an explicit message with a back link for an unknown trip', () => {
    renderPage('missing')

    expect(screen.getByText('Reise nicht gefunden')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '← Alle Reisen' }),
    ).toHaveAttribute('href', '/')
  })

  it('adds an item and updates the counter', async () => {
    const user = userEvent.setup()
    seed(EMPTY_TRIP)
    renderPage()

    await user.type(screen.getByRole('textbox'), 'Reisepass')
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))

    expect(screen.getByText('Reisepass')).toBeInTheDocument()
    expect(screen.getByText('0 von 1 gepackt')).toBeInTheDocument()
    expect(
      screen.queryByText('Noch nichts auf der Packliste'),
    ).not.toBeInTheDocument()
  })

  it('defers the empty-input error until submit and treats whitespace as empty', async () => {
    const user = userEvent.setup()
    seed(EMPTY_TRIP)
    renderPage()

    expect(
      screen.queryByText('Bitte einen Gegenstand eingeben.'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    expect(
      screen.getByText('Bitte einen Gegenstand eingeben.'),
    ).toBeInTheDocument()

    await user.type(screen.getByRole('textbox'), '   ')
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
    expect(
      screen.getByText('Bitte einen Gegenstand eingeben.'),
    ).toBeInTheDocument()
  })

  it('toggles an item, updates the counter and marks the row', async () => {
    const user = userEvent.setup()
    seed({
      ...EMPTY_TRIP,
      packing: [{ id: 'p1', label: 'Reisepass', packed: false }],
    })
    renderPage()

    const checkbox = screen.getByRole('checkbox', { name: 'Reisepass' })
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText('0 von 1 gepackt')).toBeInTheDocument()

    await user.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(screen.getByText('1 von 1 gepackt')).toBeInTheDocument()
    expect(screen.getByText('Reisepass').closest('li')).toHaveClass(
      'packing-item--checked',
    )
  })

  it('deletes an item and falls back to the empty state', async () => {
    const user = userEvent.setup()
    seed({
      ...EMPTY_TRIP,
      packing: [{ id: 'p1', label: 'Reisepass', packed: true }],
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Löschen' }))

    expect(screen.queryByText('Reisepass')).not.toBeInTheDocument()
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
    expect(
      screen.getByText('Noch nichts auf der Packliste'),
    ).toBeInTheDocument()
  })

  it('survives a reload by remounting the provider from localStorage', async () => {
    const user = userEvent.setup()
    seed(EMPTY_TRIP)
    const first = renderPage()

    await user.type(screen.getByRole('textbox'), 'Wanderschuhe')
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    await user.click(screen.getByRole('checkbox', { name: 'Wanderschuhe' }))

    first.unmount()

    renderPage()

    expect(screen.getByText('Wanderschuhe')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Wanderschuhe' })).toBeChecked()
    expect(screen.getByText('1 von 1 gepackt')).toBeInTheDocument()
    const row = screen.getByText('Wanderschuhe').closest('li')
    expect(row).toHaveClass('packing-item--checked')
    expect(within(row as HTMLElement).getByRole('button', {
      name: 'Löschen',
    })).toBeInTheDocument()
  })
})
