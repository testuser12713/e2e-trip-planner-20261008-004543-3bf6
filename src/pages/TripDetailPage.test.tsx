import { render, screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import TripDetailPage from './TripDetailPage'
import { TripStoreProvider } from '../store/TripStore'
import type { Trip } from '../types'

const TRIP: Trip = {
  id: 't1',
  name: 'Sommerurlaub Italien',
  destination: 'Rom, Italien',
  startDate: '2025-04-14',
  endDate: '2025-04-15',
  activities: [],
  packing: [],
}

const FIRST_DAY = '2025-04-14'

function seed(trip: Trip): void {
  localStorage.setItem('trip-planner.v1', JSON.stringify([trip]))
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/trips/t1']}>
      <TripStoreProvider>
        <Routes>
          <Route path="/trips/:tripId" element={<TripDetailPage />} />
        </Routes>
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

function dayOf(container: HTMLElement, date = FIRST_DAY): HTMLElement {
  const day = container.querySelector<HTMLElement>(`[data-day="${date}"]`)
  if (!day) throw new Error(`day section ${date} not found`)
  return day
}

function titlesOf(day: HTMLElement): string[] {
  return Array.from(day.querySelectorAll('.activity-title')).map(
    (node) => node.textContent ?? '',
  )
}

async function addActivity(
  user: UserEvent,
  day: HTMLElement,
  values: {
    title: string
    time: string
    location: string
    cost: string
    category: string
  },
): Promise<void> {
  await user.click(
    within(day).getByRole('button', { name: 'Aktivität hinzufügen' }),
  )
  await user.type(screen.getByLabelText('Bezeichnung'), values.title)
  await user.type(screen.getByLabelText('Uhrzeit'), values.time)
  await user.type(screen.getByLabelText('Ort'), values.location)
  await user.type(screen.getByLabelText('Kosten'), values.cost)
  await user.selectOptions(screen.getByLabelText('Kategorie'), values.category)
  await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
}

describe('TripDetailPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the trip header, day sections and navigation links', () => {
    seed(TRIP)
    renderPage()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sommerurlaub Italien' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Rom, Italien/)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Montag' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Dienstag' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '← Alle Reisen' }),
    ).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Budget' })).toHaveAttribute(
      'href',
      '/trips/t1/budget',
    )
    expect(screen.getByRole('link', { name: 'Packliste' })).toHaveAttribute(
      'href',
      '/trips/t1/packing',
    )
  })

  it('shows an inline empty state for a day without activities', () => {
    seed(TRIP)
    const { container } = renderPage()
    const day = dayOf(container)
    expect(
      within(day).getByText('Noch keine Aktivitäten für diesen Tag'),
    ).toBeInTheDocument()
  })

  it('adds an activity to the chosen day', async () => {
    const user = userEvent.setup()
    seed(TRIP)
    const { container } = renderPage()
    const day = dayOf(container)

    await addActivity(user, day, {
      title: 'Flug nach Rom',
      time: '09:30',
      location: 'Flughafen Frankfurt',
      cost: '189.90',
      category: 'travel',
    })

    expect(titlesOf(day)).toEqual(['Flug nach Rom'])
    expect(within(day).getByText('Anreise')).toBeInTheDocument()
    expect(
      within(day).queryByText('Noch keine Aktivitäten für diesen Tag'),
    ).not.toBeInTheDocument()

    const otherDay = dayOf(container, '2025-04-15')
    expect(titlesOf(otherDay)).toEqual([])
  })

  it('lists activities of a day sorted ascending by time', async () => {
    const user = userEvent.setup()
    seed(TRIP)
    const { container } = renderPage()
    const day = dayOf(container)

    await addActivity(user, day, {
      title: 'Abendessen',
      time: '19:30',
      location: 'Trastevere',
      cost: '45.50',
      category: 'food',
    })
    await addActivity(user, day, {
      title: 'Frühstück',
      time: '08:00',
      location: 'Hotel',
      cost: '12',
      category: 'food',
    })

    expect(titlesOf(day)).toEqual(['Frühstück', 'Abendessen'])
  })

  it('keeps an added activity across a remount (reload)', async () => {
    const user = userEvent.setup()
    seed(TRIP)
    const first = renderPage()
    await addActivity(user, dayOf(first.container), {
      title: 'Flug nach Rom',
      time: '09:30',
      location: 'Flughafen Frankfurt',
      cost: '189.90',
      category: 'travel',
    })
    first.unmount()

    const second = renderPage()
    expect(titlesOf(dayOf(second.container))).toEqual(['Flug nach Rom'])
  })

  it('edits an activity inline with a pre-filled form', async () => {
    const user = userEvent.setup()
    seed({
      ...TRIP,
      activities: [
        {
          id: 'a1',
          date: FIRST_DAY,
          title: 'Alt',
          time: '10:00',
          location: 'Alt-Ort',
          cost: 5,
          category: 'activity',
        },
      ],
    })
    const { container } = renderPage()
    const day = dayOf(container)

    await user.click(within(day).getByRole('button', { name: 'Bearbeiten' }))
    const titleInput = screen.getByLabelText('Bezeichnung')
    expect(titleInput).toHaveValue('Alt')
    await user.clear(titleInput)
    await user.type(titleInput, 'Neu')
    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(titlesOf(day)).toEqual(['Neu'])
    expect(within(day).queryByText('Alt')).not.toBeInTheDocument()
  })

  it('deletes an activity after confirming', async () => {
    const user = userEvent.setup()
    seed({
      ...TRIP,
      activities: [
        {
          id: 'a1',
          date: FIRST_DAY,
          title: 'Zu löschen',
          time: '10:00',
          location: 'Ort',
          cost: 5,
          category: 'activity',
        },
      ],
    })
    const { container } = renderPage()
    const day = dayOf(container)

    await user.click(within(day).getByRole('button', { name: 'Löschen' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Löschen' }))

    expect(titlesOf(day)).toEqual([])
    expect(
      within(day).getByText('Noch keine Aktivitäten für diesen Tag'),
    ).toBeInTheDocument()
  })

  it('shows field errors only after submit', async () => {
    const user = userEvent.setup()
    seed(TRIP)
    const { container } = renderPage()
    const day = dayOf(container)

    await user.click(
      within(day).getByRole('button', { name: 'Aktivität hinzufügen' }),
    )
    expect(screen.queryByText('Bitte eine Bezeichnung eingeben.')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Hinzufügen' }))
    expect(
      screen.getByText('Bitte eine Bezeichnung eingeben.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bitte eine Uhrzeit eingeben.')).toBeInTheDocument()
  })
})
