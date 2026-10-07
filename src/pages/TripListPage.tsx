import { Link } from 'react-router-dom'
import { useTripStore } from '../store/TripStore'
import { formatDate } from '../lib/format'

export default function TripListPage() {
  const { trips } = useTripStore()

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Meine Reisen</h1>
      </header>

      {trips.length === 0 ? (
        <section className="empty-state" aria-labelledby="trip-list-empty-title">
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
            disabled
            aria-disabled="true"
            title="Diese Funktion folgt in einem späteren Schritt."
          >
            Reise anlegen
          </button>
        </section>
      ) : (
        <ul className="trip-list">
          {trips.map((trip) => (
            <li key={trip.id} className="trip-list__item">
              <Link to={`/trips/${trip.id}`} className="trip-list__link">
                <span className="trip-list__name">{trip.name}</span>
                <span className="trip-list__meta">
                  {trip.destination} · {formatDate(trip.startDate)} –{' '}
                  {formatDate(trip.endDate)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
