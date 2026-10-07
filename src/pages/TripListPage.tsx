import { useState } from 'react'
import { useTripStore } from '../store/TripStore'
import TripForm from '../components/TripForm'
import TripListItem from '../components/TripListItem'
import type { TripInput } from '../types'

export default function TripListPage() {
  const { trips, createTrip } = useTripStore()
  const [showForm, setShowForm] = useState(false)

  function handleCreate(input: TripInput) {
    createTrip(input)
    setShowForm(false)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Meine Reisen</h1>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setShowForm((open) => !open)}
          aria-expanded={showForm}
        >
          Neue Reise anlegen
        </button>
      </header>

      {showForm && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <TripForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {trips.length === 0 ? (
        showForm ? null : (
          <section
            className="empty-state card"
            aria-labelledby="trip-list-empty-title"
          >
            <div className="empty-state__icon" aria-hidden="true">
              ✈
            </div>
            <h2 id="trip-list-empty-title" className="empty-state__title">
              Noch keine Reisen
            </h2>
            <p className="empty-state__text">
              Lege deine erste Reise an, um Tagesplan, Budget und Packliste zu
              planen.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setShowForm(true)}
            >
              Reise anlegen
            </button>
          </section>
        )
      ) : (
        <ul className="trip-list" id="trip-list">
          {trips.map((trip) => (
            <TripListItem key={trip.id} trip={trip} />
          ))}
        </ul>
      )}
    </div>
  )
}
