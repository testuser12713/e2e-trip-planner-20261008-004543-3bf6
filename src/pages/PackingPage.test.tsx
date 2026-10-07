import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import PackingPage from './PackingPage'
import { TripStoreProvider } from '../store/TripStore'
import { STORAGE_KEY } from '../storage'

const TRIP_ID = 't1'
const DAY_1 = '2025-04-14'
const DAY_2 = '2025-04-16'

function trip(overrides: Record<string, unknown> = {}) {
  return {
    id: TRIP_ID,
    name: 'Sommerurlaub Italien',
    destination: 'Rom, Italien',
    startDate: DAY_1,
    endDate: DAY_2,
    activities: [],
    packing: [],
    ...overrides,
  }
}

function item(overrides: Record<string, unknown> = {}) {
  return { id: 'p1', label: 'Reisepass', packed: false, ...overrides }
}

function seed(trips: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

function renderPacking(tripId: string = TRIP_ID) {
  return render(
    <MemoryRouter initialEntries={[`/trips/${tripId}/packing`]}>
      <TripStoreProvider>
        <Routes>
          <Route path="/trips/:tripId/packing" element={<PackingPage />} />
          <Route path="/" element={<h1>Deine Reisen</h1>} />
          <Route path="/trips/:tripId" element={<h1>Tagesplan</h1>} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

function addInput(): HTMLInputElement {
  return screen.getByLabelText('Gegenstand') as HTMLInputElement
}

async function addItem(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
) {
  await user.type(addInput(), label)
  await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
}

function rowOf(label: string): HTMLElement {
  const text = screen.getByText(label)
  const row = text.closest('.packing-item')
  if (!row) throw new Error(`No packing row for ${label}`)
  return row as HTMLElement
}

describe('PackingPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the header, trip meta, counter and the day-plan link', () => {
    seed([trip()])
    renderPacking()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Packliste' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Rom, Italien · 14.04.2025 – 16.04.2025')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Alle Reisen' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Tagesplan' })).toHaveAttribute(
      'href',
      `/trips/${TRIP_ID}`,
    )
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
  })

  it('renders the unknown-trip state instead of a blank page', () => {
    seed([trip()])
    renderPacking('missing-id')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Packliste' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/nicht gefunden/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Alle Reisen' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('shows the packing empty state with its action when there are no items', () => {
    seed([trip()])
    renderPacking()

    expect(screen.getByText('Noch nichts eingepackt')).toBeInTheDocument()
    expect(
      screen.getByText(/Deine Packliste ist noch leer/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Gegenstand hinzufügen' }),
    ).toBeInTheDocument()
  })

  it('adds an item through the form and updates the counter', async () => {
    const user = userEvent.setup()
    seed([trip()])
    renderPacking()

    await addItem(user, 'Reisepass')

    expect(screen.getByText('Reisepass')).toBeInTheDocument()
    expect(screen.getByText('0 von 1 gepackt')).toBeInTheDocument()
    expect(addInput().value).toBe('')
  })

  it('keeps the empty-input error deferred until the form was submitted', async () => {
    const user = userEvent.setup()
    seed([trip()])
    renderPacking()

    expect(
      screen.queryByText('Bitte einen Gegenstand eingeben.'),
    ).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))

    expect(
      screen.getByText('Bitte einen Gegenstand eingeben.'),
    ).toBeInTheDocument()
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
  })

  it('treats whitespace-only input as empty and adds nothing', async () => {
    const user = userEvent.setup()
    seed([trip()])
    renderPacking()

    await user.type(addInput(), '   ')
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))

    expect(
      screen.getByText('Bitte einen Gegenstand eingeben.'),
    ).toBeInTheDocument()
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
  })

  it('clears the error as soon as the input becomes valid', async () => {
    const user = userEvent.setup()
    seed([trip()])
    renderPacking()

    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    expect(
      screen.getByText('Bitte einen Gegenstand eingeben.'),
    ).toBeInTheDocument()

    await user.type(addInput(), 'Reisepass')
    expect(
      screen.queryByText('Bitte einen Gegenstand eingeben.'),
    ).toBeNull()
  })

  it('toggles an item, updating the counter and the checked marker', async () => {
    const user = userEvent.setup()
    seed([
      trip({
        packing: [
          item({ id: 'p1', label: 'Reisepass', packed: false }),
          item({ id: 'p2', label: 'Sonnencreme', packed: false }),
        ],
      }),
    ])
    renderPacking()

    expect(screen.getByText('0 von 2 gepackt')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Reisepass' }))

    expect(screen.getByText('1 von 2 gepackt')).toBeInTheDocument()
    expect(rowOf('Reisepass')).toHaveClass('packing-item--checked')

    await user.click(screen.getByRole('checkbox', { name: 'Reisepass' }))

    expect(screen.getByText('0 von 2 gepackt')).toBeInTheDocument()
    expect(rowOf('Reisepass')).not.toHaveClass('packing-item--checked')
  })

  it('deletes an item through its per-row button', async () => {
    const user = userEvent.setup()
    seed([trip({ packing: [item({ label: 'Reisepass' })] })])
    renderPacking()

    await user.click(
      within(rowOf('Reisepass')).getByRole('button', { name: 'Löschen' }),
    )

    expect(screen.queryByText('Reisepass')).toBeNull()
    expect(screen.getByText('0 von 0 gepackt')).toBeInTheDocument()
    expect(screen.getByText(/Deine Packliste ist noch leer/)).toBeInTheDocument()
  })

  it('keeps an added and packed item after remounting from localStorage', async () => {
    const user = userEvent.setup()
    seed([trip()])
    const view = renderPacking()

    await addItem(user, 'Reisepass')
    await user.click(screen.getByRole('checkbox', { name: 'Reisepass' }))

    expect(screen.getByText('1 von 1 gepackt')).toBeInTheDocument()

    view.unmount()
    renderPacking()

    expect(screen.getByText('1 von 1 gepackt')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Reisepass' })).toBeChecked()
    expect(rowOf('Reisepass')).toHaveClass('packing-item--checked')
  })
})
