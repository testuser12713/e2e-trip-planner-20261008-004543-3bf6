import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import TripListPage from './TripListPage'
import { TripStoreProvider } from '../store/TripStore'
import { STORAGE_KEY } from '../storage'

function renderPage() {
  return render(
    <MemoryRouter>
      <TripStoreProvider>
        <TripListPage />
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

async function createTrip(name = 'Sommerurlaub Italien') {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Reise anlegen' }))
  await user.type(screen.getByLabelText('Name'), name)
  await user.type(screen.getByLabelText('Reiseziel'), 'Rom, Italien')
  fireEvent.change(screen.getByLabelText('Startdatum'), {
    target: { value: '2025-04-14' },
  })
  fireEvent.change(screen.getByLabelText('Enddatum'), {
    target: { value: '2025-04-20' },
  })
  await user.click(screen.getByRole('button', { name: 'Speichern' }))
}

describe('TripListPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('shows the explicit empty state when no trip is stored', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Deine Reisen' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reise anlegen' }),
    ).toBeInTheDocument()
  })

  it('keeps both create controls with their distinct labels', () => {
    renderPage()

    expect(
      screen.getByRole('button', { name: 'Neue Reise anlegen' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reise anlegen' }),
    ).toBeInTheDocument()
  })

  it('creates a trip from the form and lists name, destination and period', async () => {
    renderPage()
    await createTrip()

    expect(screen.getByText('Sommerurlaub Italien')).toBeInTheDocument()
    expect(screen.getByText('Rom, Italien')).toBeInTheDocument()
    expect(screen.getByText('14.04.2025 – 20.04.2025')).toBeInTheDocument()
    expect(screen.queryByText('Noch keine Reisen')).not.toBeInTheDocument()
  })

  it('survives a fresh mount (reload from localStorage)', async () => {
    const first = renderPage()
    await createTrip()
    first.unmount()

    renderPage()

    expect(screen.getByText('Sommerurlaub Italien')).toBeInTheDocument()
    expect(screen.getByText('14.04.2025 – 20.04.2025')).toBeInTheDocument()
  })

  it('links every trip card to /trips/<its id>', async () => {
    renderPage()
    await createTrip()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    const link = screen.getByRole('link', { name: /Sommerurlaub Italien/ })

    expect(link).toHaveAttribute('href', `/trips/${stored[0].id}`)
  })

  it('shows no error on an untouched create form and errors only after submit', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Reise anlegen' }))

    expect(
      screen.queryByText('Bitte einen Reisenamen eingeben.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Bitte ein Reiseziel eingeben.'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      screen.getByText('Bitte einen Reisenamen eingeben.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Bitte ein Reiseziel eingeben.'),
    ).toBeInTheDocument()
  })

  it('renames a trip inline and saves with the Speichern button', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Reisename')
    await user.clear(input)
    await user.type(input, 'Städtetrip Rom')
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(screen.getByText('Städtetrip Rom')).toBeInTheDocument()
    expect(screen.queryByText('Sommerurlaub Italien')).not.toBeInTheDocument()
  })

  it('renames a trip with Enter', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Reisename')
    await user.clear(input)
    await user.type(input, 'Per Enter')
    await user.keyboard('{Enter}')

    expect(screen.getByText('Per Enter')).toBeInTheDocument()
    expect(screen.queryByLabelText('Reisename')).not.toBeInTheDocument()
  })

  it('cancels a rename with Escape without changing the name', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Reisename')
    await user.clear(input)
    await user.type(input, 'Verworfen')
    await user.keyboard('{Escape}')

    expect(screen.queryByLabelText('Reisename')).not.toBeInTheDocument()
    expect(screen.getByText('Sommerurlaub Italien')).toBeInTheDocument()
    expect(screen.queryByText('Verworfen')).not.toBeInTheDocument()
  })

  it('shows the field-local error when an empty rename is saved', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    await user.clear(screen.getByLabelText('Reisename'))
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      screen.getByText('Bitte einen Reisenamen eingeben.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Reisename')).toBeInTheDocument()
  })

  it('deletes a trip after confirming, naming the exact trip', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Löschen' }))
    const dialog = screen.getByRole('dialog')

    expect(
      within(dialog).getByRole('heading', { name: 'Reise löschen?' }),
    ).toBeInTheDocument()
    expect(within(dialog).getByText(/Sommerurlaub Italien/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Budgetdaten/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Löschen' }))

    expect(screen.queryByText('Sommerurlaub Italien')).not.toBeInTheDocument()
    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
  })

  it('cancels the delete dialog with Abbrechen and keeps the trip', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Löschen' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Sommerurlaub Italien')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Löschen' })).toHaveFocus()
  })

  it('cancels the delete dialog with Escape and keeps the trip', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Löschen' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Sommerurlaub Italien')).toBeInTheDocument()
  })

  it('persists a rename across a fresh mount', async () => {
    const user = userEvent.setup()
    const first = renderPage()
    await createTrip()

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Reisename')
    await user.clear(input)
    await user.type(input, 'Dauerhaft umbenannt')
    await user.keyboard('{Enter}')
    first.unmount()

    renderPage()

    expect(screen.getByText('Dauerhaft umbenannt')).toBeInTheDocument()
  })
})
