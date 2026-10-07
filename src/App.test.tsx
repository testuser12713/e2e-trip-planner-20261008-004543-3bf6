import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './storage'
import { TripStoreProvider, useTripStore } from './store/TripStore'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TripStoreProvider>
        <App />
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the shared header and the trip list empty state on /', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Reiseplaner' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Hauptnavigation' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reisen' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Deine Reisen' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reise anlegen' }),
    ).toBeInTheDocument()
  })

  it.each([
    ['/trips/abc', 'Tagesplan'],
    ['/trips/abc/budget', 'Budget'],
    ['/trips/abc/packing', 'Packliste'],
  ])('renders %s inside the shared shell', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('link', { name: 'Reiseplaner' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Hauptnavigation' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: heading }),
    ).toBeInTheDocument()
  })

  it('navigates back to the trip list via the header wordmark', async () => {
    const user = userEvent.setup()
    renderAt('/trips/abc')
    await user.click(screen.getByRole('link', { name: 'Reiseplaner' }))
    expect(
      screen.getByRole('heading', { level: 1, name: 'Deine Reisen' }),
    ).toBeInTheDocument()
  })
})

function StoreProbe() {
  const { trips, createTrip } = useTripStore()
  return (
    <div>
      <span data-testid="trip-count">{trips.length}</span>
      <button
        type="button"
        onClick={() =>
          createTrip({
            name: 'Rom',
            destination: 'Italien',
            startDate: '2025-04-14',
            endDate: '2025-04-18',
          })
        }
      >
        Anlegen
      </button>
    </div>
  )
}

function renderProbe() {
  return render(
    <MemoryRouter>
      <TripStoreProvider>
        <StoreProbe />
      </TripStoreProvider>
    </MemoryRouter>,
  )
}

describe('TripStore persistence (AC-02)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('writes the full state to the single key on mutation and rehydrates on remount', async () => {
    const user = userEvent.setup()
    const first = renderProbe()

    expect(screen.getByTestId('trip-count')).toHaveTextContent('0')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Anlegen' }))

    expect(screen.getByTestId('trip-count')).toHaveTextContent('1')
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

    first.unmount()

    renderProbe()
    expect(screen.getByTestId('trip-count')).toHaveTextContent('1')
  })
})
