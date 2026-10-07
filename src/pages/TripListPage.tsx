import { useState } from 'react'
import { useTripStore } from '../store/TripStore'
import TripForm from '../components/TripForm'
import TripListItem from '../components/TripListItem'
import '../styles/trip-list.css'

export default function TripListPage() {
  const { trips } = useTripStore()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Deine Reisen</h1>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setShowForm(true)}
        >
          Neue Reise anlegen
        </button>
      </header>

      {trips.length === 0 ? (
        <section
          className="card empty-state"
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
      ) : (
        <div className="trip-list">
          {trips.map((trip) => (
            <TripListItem key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {showForm && <TripForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
