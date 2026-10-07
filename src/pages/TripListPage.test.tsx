import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import TripListPage from './TripListPage'
import { TripStoreProvider } from '../store/TripStore'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <TripStoreProvider>
        <TripListPage />
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

async function createTrip(user: UserEvent, name = 'Japan Rundreise') {
  await user.click(screen.getByRole('button', { name: 'Neue Reise anlegen' }))
  const dialog = await screen.findByRole('dialog')
  await user.type(within(dialog).getByLabelText('Name'), name)
  await user.type(within(dialog).getByLabelText('Reiseziel'), 'Kyoto')
  fireEvent.change(within(dialog).getByLabelText('Startdatum'), {
    target: { value: '2025-04-14' },
  })
  fireEvent.change(within(dialog).getByLabelText('Enddatum'), {
    target: { value: '2025-04-20' },
  })
  await user.click(within(dialog).getByRole('button', { name: 'Speichern' }))
  await screen.findByText(name)
}

describe('TripListPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the header and the explicit empty state when no trip is stored', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Deine Reisen' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reise anlegen' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Umbenennen' }),
    ).not.toBeInTheDocument()
  })

  it('creates a trip, lists it with name, destination and period, and survives a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderPage()

    await createTrip(user)

    const dialogGone = screen.queryByRole('dialog')
    expect(dialogGone).not.toBeInTheDocument()
    expect(screen.getByText('Kyoto')).toBeInTheDocument()
    expect(screen.getByText(/14\.04\.2025/)).toBeInTheDocument()
    expect(screen.getByText(/20\.04\.2025/)).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /Japan Rundreise/ })
    expect(link.getAttribute('href')).toMatch(/^\/trips\/.+/)

    // Fresh mount: the store rehydrates from localStorage.
    unmount()
    renderPage()
    expect(await screen.findByText('Japan Rundreise')).toBeInTheDocument()
    expect(screen.getByText('Kyoto')).toBeInTheDocument()
  })

  it('does not create a trip when the form is cancelled', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(
      screen.getByRole('button', { name: 'Neue Reise anlegen' }),
    )
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
  })

  it('renames a trip inline on click and keeps the new name after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderPage()
    await createTrip(user)

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Reisename')
    expect(input).toHaveValue('Japan Rundreise')

    await user.clear(input)
    await user.type(input, 'Kanada')
    await user.keyboard('{Enter}')

    expect(await screen.findByText('Kanada')).toBeInTheDocument()
    expect(screen.queryByLabelText('Reisename')).not.toBeInTheDocument()

    unmount()
    renderPage()
    expect(await screen.findByText('Kanada')).toBeInTheDocument()
  })

  it('cancels an inline rename with Escape', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip(user)

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Reisename')
    await user.clear(input)
    await user.type(input, 'Verworfen')
    await user.keyboard('{Escape}')

    expect(screen.queryByLabelText('Reisename')).not.toBeInTheDocument()
    expect(screen.getByText('Japan Rundreise')).toBeInTheDocument()
    expect(screen.queryByText('Verworfen')).not.toBeInTheDocument()
  })

  it('shows a field-local error for an empty rename and keeps the old name', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip(user)

    await user.click(screen.getByRole('button', { name: 'Umbenennen' }))
    const input = screen.getByLabelText('Reisename')
    await user.clear(input)
    await user.keyboard('{Enter}')

    expect(
      await screen.findByText('Bitte einen Reisenamen eingeben.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Reisename')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    expect(screen.getByText('Japan Rundreise')).toBeInTheDocument()
  })

  it('asks for confirmation before deleting and cancels cleanly', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip(user)

    await user.click(screen.getByRole('button', { name: 'Löschen' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Reise löschen?')).toBeInTheDocument()
    expect(
      within(dialog).getByText(/Japan Rundreise/),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText(/Aktivitäten, Budgetdaten und die Packliste/),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Japan Rundreise')).toBeInTheDocument()
  })

  it('deletes the trip when the confirmation is accepted', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip(user)

    await user.click(screen.getByRole('button', { name: 'Löschen' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Löschen' }))

    expect(await screen.findByText('Noch keine Reisen')).toBeInTheDocument()
    expect(screen.queryByText('Japan Rundreise')).not.toBeInTheDocument()
  })

  it('cancels the delete confirmation with Escape', async () => {
    const user = userEvent.setup()
    renderPage()
    await createTrip(user)

    await user.click(screen.getByRole('button', { name: 'Löschen' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Japan Rundreise')).toBeInTheDocument()
  })

  it('validates the create form only after a field is touched or submit is attempted', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(
      screen.getByRole('button', { name: 'Neue Reise anlegen' }),
    )
    const dialog = await screen.findByRole('dialog')

    // Untouched form shows no error.
    expect(
      within(dialog).queryByText('Bitte einen Reisenamen eingeben.'),
    ).not.toBeInTheDocument()
    expect(
      within(dialog).queryByText('Bitte ein Reiseziel eingeben.'),
    ).not.toBeInTheDocument()

    // Submitting the empty form reveals every field error.
    await user.click(within(dialog).getByRole('button', { name: 'Speichern' }))
    expect(
      await within(dialog).findByText('Bitte einen Reisenamen eingeben.'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Bitte ein Reiseziel eingeben.'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Bitte ein Startdatum auswählen.'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Bitte ein Enddatum auswählen.'),
    ).toBeInTheDocument()

    // Typing into a field clears its own error, the others stay.
    await user.type(within(dialog).getByLabelText('Name'), 'A')
    expect(
      within(dialog).queryByText('Bitte einen Reisenamen eingeben.'),
    ).not.toBeInTheDocument()
    expect(
      within(dialog).getByText('Bitte ein Reiseziel eingeben.'),
    ).toBeInTheDocument()
  })
})
