import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import TripListPage from './TripListPage'
import { TripStoreProvider } from '../store/TripStore'
import { STORAGE_KEY } from '../storage'
import type { Trip } from '../types'

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 't1',
    name: 'Sommerurlaub Italien',
    destination: 'Rom',
    startDate: '2025-04-14',
    endDate: '2025-04-20',
    activities: [
      {
        id: 'a1',
        title: 'Kolosseum',
        time: '09:30',
        location: 'Rom',
        cost: 20,
        category: 'activity',
      },
    ],
    packing: [{ id: 'p1', label: 'Pass', packed: false }],
    ...overrides,
  }
}

function seed(trips: Trip[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TripStoreProvider>
        <TripListPage />
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

function storedTrips(): Trip[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Trip[]) : []
}

describe('TripListPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows an explicit empty state when no trip exists', () => {
    renderPage()
    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
  })

  it('creates a trip and lists it with destination and period', async () => {
    const user = userEvent.setup()
    const { unmount } = renderPage()

    await user.click(screen.getByRole('button', { name: 'Neue Reise anlegen' }))
    await user.type(screen.getByLabelText('Name'), 'Sommerurlaub Italien')
    await user.type(screen.getByLabelText('Ziel'), 'Rom')
    fireEvent.change(screen.getByLabelText('Startdatum'), {
      target: { value: '2025-04-14' },
    })
    fireEvent.change(screen.getByLabelText('Enddatum'), {
      target: { value: '2025-04-20' },
    })
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    const link = screen.getByRole('link', { name: /Sommerurlaub Italien/ })
    expect(link).toBeInTheDocument()
    expect(within(link).getByText(/Rom/)).toBeInTheDocument()
    expect(within(link).getByText(/14\.04\.2025 – 20\.04\.2025/)).toBeInTheDocument()

    // Survives a "reload" (fresh mount reads the persisted state again).
    unmount()
    renderPage()
    expect(
      screen.getByRole('link', { name: /Sommerurlaub Italien/ }),
    ).toBeInTheDocument()
  })

  it('links every trip to its detail route', () => {
    seed([makeTrip()])
    renderPage()
    expect(
      screen.getByRole('link', { name: /Sommerurlaub Italien/ }),
    ).toHaveAttribute('href', '/trips/t1')
  })

  it('shows no field errors on an untouched form', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Neue Reise anlegen' }))

    expect(
      screen.queryByText('Bitte einen Reisenamen eingeben.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Bitte ein Reiseziel eingeben.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Bitte ein Startdatum auswählen.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Bitte ein Enddatum auswählen.'),
    ).not.toBeInTheDocument()
  })

  it('shows a specific error per field after a submit attempt', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Neue Reise anlegen' }))
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      screen.getByText('Bitte einen Reisenamen eingeben.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bitte ein Reiseziel eingeben.')).toBeInTheDocument()
    expect(
      screen.getByText('Bitte ein Startdatum auswählen.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bitte ein Enddatum auswählen.')).toBeInTheDocument()
    // Nothing was created.
    expect(storedTrips()).toHaveLength(0)
  })

  it('shows the name error once the field has been touched', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Neue Reise anlegen' }))
    const name = screen.getByLabelText('Name')
    await user.type(name, 'a')
    await user.clear(name)

    expect(
      screen.getByText('Bitte einen Reisenamen eingeben.'),
    ).toBeInTheDocument()
  })

  it('keeps an untouched field error-free after focus and blur', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Neue Reise anlegen' }))
    await user.click(screen.getByLabelText('Name'))
    await user.tab()

    expect(
      screen.queryByText('Bitte einen Reisenamen eingeben.'),
    ).not.toBeInTheDocument()
  })

  it('rejects an end date before the start date', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Neue Reise anlegen' }))
    await user.type(screen.getByLabelText('Name'), 'Test')
    await user.type(screen.getByLabelText('Ziel'), 'Ort')
    fireEvent.change(screen.getByLabelText('Startdatum'), {
      target: { value: '2025-04-20' },
    })
    fireEvent.change(screen.getByLabelText('Enddatum'), {
      target: { value: '2025-04-14' },
    })
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      screen.getByText('Das Enddatum darf nicht vor dem Startdatum liegen.'),
    ).toBeInTheDocument()
    expect(storedTrips()).toHaveLength(0)
  })

  it('renames a trip inline and persists the new name', async () => {
    seed([makeTrip()])
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Name')
    await user.clear(input)
    await user.type(input, 'Herbsturlaub')
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(screen.getByText('Herbsturlaub')).toBeInTheDocument()
    expect(storedTrips()[0].name).toBe('Herbsturlaub')
  })

  it('saves inline rename with Enter and cancels with Escape', async () => {
    seed([makeTrip()])
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    let input = screen.getByLabelText('Name')
    await user.clear(input)
    await user.type(input, 'Per Enter{Enter}')
    expect(screen.getByText('Per Enter')).toBeInTheDocument()
    expect(storedTrips()[0].name).toBe('Per Enter')

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    input = screen.getByLabelText('Name')
    await user.clear(input)
    await user.type(input, 'Verworfen{Escape}')
    expect(screen.getByText('Per Enter')).toBeInTheDocument()
    expect(storedTrips()[0].name).toBe('Per Enter')
  })

  it('keeps the old name and shows an error when renaming to empty', async () => {
    seed([makeTrip()])
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Name')
    await user.clear(input)
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      screen.getByText('Bitte einen Reisenamen eingeben.'),
    ).toBeInTheDocument()
    expect(storedTrips()[0].name).toBe('Sommerurlaub Italien')
  })

  it('asks for confirmation before deleting and removes the whole trip', async () => {
    seed([makeTrip()])
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Löschen' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Reise löschen?')).toBeInTheDocument()
    expect(
      within(dialog).getByText(/Sommerurlaub Italien/),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(/Aktivitäten, Budgetdaten und die Packliste/),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Löschen' }))

    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
    // The trip and everything it carried are gone.
    expect(storedTrips()).toEqual([])
  })

  it('cancels the delete confirmation without removing the trip', async () => {
    seed([makeTrip()])
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Löschen' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Abbrechen',
      }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Sommerurlaub Italien/ }),
    ).toBeInTheDocument()
    expect(storedTrips()).toHaveLength(1)
  })
})
