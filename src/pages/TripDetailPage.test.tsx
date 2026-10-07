import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import TripDetailPage from './TripDetailPage'
import { TripStoreProvider } from '../store/TripStore'
import { STORAGE_KEY } from '../storage'

const TRIP_ID = 't1'
const DAY_1 = '2025-04-14'
const DAY_2 = '2025-04-15'
const DAY_3 = '2025-04-16'

function trip(overrides: Record<string, unknown> = {}) {
  return {
    id: TRIP_ID,
    name: 'Sommerurlaub Italien',
    destination: 'Rom, Italien',
    startDate: DAY_1,
    endDate: DAY_3,
    activities: [],
    packing: [],
    ...overrides,
  }
}

function activity(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1',
    title: 'Mittagessen',
    time: '13:00',
    location: 'Trastevere',
    cost: 45.5,
    category: 'food',
    date: DAY_2,
    ...overrides,
  }
}

function seed(trips: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

function renderDetail(tripId: string = TRIP_ID) {
  return render(
    <MemoryRouter initialEntries={[`/trips/${tripId}`]}>
      <TripStoreProvider>
        <Routes>
          <Route path="/trips/:tripId" element={<TripDetailPage />} />
          <Route path="/" element={<h1>Deine Reisen</h1>} />
          <Route path="/trips/:tripId/budget" element={<h1>Budget</h1>} />
          <Route path="/trips/:tripId/packing" element={<h1>Packliste</h1>} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

function daySection(date: string): HTMLElement {
  const element = document.querySelector(`[data-day="${date}"]`)
  if (!element) throw new Error(`No day section for ${date}`)
  return element as HTMLElement
}

function titlesInDay(date: string): string[] {
  return Array.from(
    daySection(date).querySelectorAll('.activity-title'),
  ).map((node) => node.textContent ?? '')
}

async function addActivity(
  user: ReturnType<typeof userEvent.setup>,
  date: string,
  values: {
    title: string
    time: string
    location: string
    cost: string
    category: string
  },
) {
  await user.click(
    within(daySection(date)).getByRole('button', {
      name: 'Aktivität hinzufügen',
    }),
  )
  const form = daySection(date).querySelector('form')
  if (!form) throw new Error('Activity form did not open')
  fireEvent.change(within(form).getByLabelText('Bezeichnung'), {
    target: { value: values.title },
  })
  fireEvent.change(within(form).getByLabelText('Uhrzeit'), {
    target: { value: values.time },
  })
  fireEvent.change(within(form).getByLabelText('Ort'), {
    target: { value: values.location },
  })
  fireEvent.change(within(form).getByLabelText('Kosten'), {
    target: { value: values.cost },
  })
  fireEvent.change(within(form).getByLabelText('Kategorie'), {
    target: { value: values.category },
  })
  await user.click(within(form).getByRole('button', { name: 'Hinzufügen' }))
}

describe('TripDetailPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the trip header, period and links to budget, packing and the list', () => {
    seed([trip()])
    renderDetail()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sommerurlaub Italien' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Rom, Italien · 14.04.2025 – 16.04.2025')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: '← Alle Reisen' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Budget' })).toHaveAttribute(
      'href',
      `/trips/${TRIP_ID}/budget`,
    )
    expect(screen.getByRole('link', { name: 'Packliste' })).toHaveAttribute(
      'href',
      `/trips/${TRIP_ID}/packing`,
    )
  })

  it('renders one labelled day section per date of the period', () => {
    seed([trip()])
    renderDetail()

    expect(screen.getByRole('heading', { level: 2, name: 'Montag' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Dienstag' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Mittwoch' })).toBeInTheDocument()
    expect(screen.getByText('14.04.2025')).toBeInTheDocument()
    expect(screen.getByText('15.04.2025')).toBeInTheDocument()
    expect(screen.getByText('16.04.2025')).toBeInTheDocument()
  })

  it('renders the unknown-trip state instead of a blank page', () => {
    seed([trip()])
    renderDetail('missing-id')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Tagesplan' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/nicht gefunden/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '← Alle Reisen' })).toBeInTheDocument()
  })

  it('adds an activity to the day matching its date and sorts by time', async () => {
    const user = userEvent.setup()
    seed([trip({ activities: [activity()] })])
    renderDetail()

    await addActivity(user, DAY_2, {
      title: 'Frühstück',
      time: '09:00',
      location: 'Piazza Navona',
      cost: '12.5',
      category: 'food',
    })

    expect(titlesInDay(DAY_2)).toEqual(['Frühstück', 'Mittagessen'])
    expect(within(daySection(DAY_1)).queryByText('Frühstück')).toBeNull()
  })

  it('shows the inline empty state for days without activities', () => {
    seed([trip()])
    renderDetail()

    expect(
      screen.getAllByText('Noch keine Aktivitäten für diesen Tag'),
    ).toHaveLength(3)
  })

  it('validates fields only after submit and submits a complete activity', async () => {
    const user = userEvent.setup()
    seed([trip()])
    renderDetail()

    await user.click(
      within(daySection(DAY_1)).getByRole('button', {
        name: 'Aktivität hinzufügen',
      }),
    )

    expect(screen.queryByText('Bitte eine Bezeichnung eingeben.')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    expect(
      screen.getByText('Bitte eine Bezeichnung eingeben.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bitte eine Uhrzeit eingeben.')).toBeInTheDocument()
    expect(screen.getByText('Bitte einen Ort eingeben.')).toBeInTheDocument()
    expect(screen.getByText('Bitte die Kosten eingeben.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Bezeichnung'), {
      target: { value: 'Stadtrundgang' },
    })
    fireEvent.change(screen.getByLabelText('Uhrzeit'), {
      target: { value: '11:00' },
    })
    fireEvent.change(screen.getByLabelText('Ort'), {
      target: { value: 'Centro Storico' },
    })
    fireEvent.change(screen.getByLabelText('Kosten'), {
      target: { value: '0' },
    })
    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))

    expect(titlesInDay(DAY_1)).toEqual(['Stadtrundgang'])
  })

  it('edits an activity in place', async () => {
    const user = userEvent.setup()
    seed([trip({ activities: [activity({ title: 'Alt' })] })])
    renderDetail()

    await user.click(
      within(daySection(DAY_2)).getByRole('button', { name: 'Bearbeiten' }),
    )
    const form = daySection(DAY_2).querySelector('form')
    if (!form) throw new Error('Edit form did not open')

    fireEvent.change(within(form).getByLabelText('Bezeichnung'), {
      target: { value: 'Neu' },
    })
    await user.click(within(form).getByRole('button', { name: 'Speichern' }))

    expect(titlesInDay(DAY_2)).toEqual(['Neu'])
    expect(within(daySection(DAY_2)).queryByText('Alt')).toBeNull()
  })

  it('deletes an activity only after confirming in the dialog', async () => {
    const user = userEvent.setup()
    seed([trip({ activities: [activity({ title: 'Löschtest' })] })])
    renderDetail()

    await user.click(
      within(daySection(DAY_2)).getByRole('button', { name: 'Löschen' }),
    )

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Löschtest/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Löschen' }))

    expect(titlesInDay(DAY_2)).toEqual([])
    expect(
      within(daySection(DAY_2)).getByText('Noch keine Aktivitäten für diesen Tag'),
    ).toBeInTheDocument()
  })

  it('keeps an added activity after remounting the provider from localStorage', async () => {
    const user = userEvent.setup()
    seed([trip()])
    const view = renderDetail()

    await addActivity(user, DAY_3, {
      title: 'Rückflug',
      time: '15:00',
      location: 'Flughafen Fiumicino',
      cost: '0',
      category: 'travel',
    })

    view.unmount()
    renderDetail()

    expect(titlesInDay(DAY_3)).toEqual(['Rückflug'])
    expect(
      within(daySection(DAY_3)).getByText('15:00'),
    ).toBeInTheDocument()
  })
})
