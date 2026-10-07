import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { TripStoreProvider } from './store/TripStore'

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
      screen.getByRole('heading', { level: 1, name: 'Deine Reisen' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Noch keine Reisen')).toBeInTheDocument()
  })

  it.each([
    ['/trips/abc', 'Tagesplan'],
    ['/trips/abc/budget', 'Budget'],
    ['/trips/abc/packing', 'Packliste'],
  ])('renders %s inside the shared shell', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('link', { name: 'Reiseplaner' })).toBeInTheDocument()
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
