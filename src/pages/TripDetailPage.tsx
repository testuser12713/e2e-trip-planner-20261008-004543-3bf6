import { Link, useParams } from 'react-router-dom'
import DaySection from '../components/DaySection'
import { useTripStore } from '../store/TripStore'
import { eachDateInRange, formatDate } from '../lib/format'
import '../styles/trip-detail.css'

export default function TripDetailPage() {
  const { tripId } = useParams()
  const { getTrip, addActivity, updateActivity, deleteActivity } = useTripStore()

  const trip = tripId ? getTrip(tripId) : undefined

  if (!trip) {
    return (
      <div className="page">
        <Link className="page-back" to="/">
          ← Alle Reisen
        </Link>
        <h1 className="page-title">Tagesplan</h1>
        <p className="trip-notfound">
          Diese Reise wurde nicht gefunden. Zurück zur Reiseübersicht über den
          Link oben.
        </p>
      </div>
    )
  }

  const dates = eachDateInRange(trip.startDate, trip.endDate)

  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Alle Reisen
      </Link>

      <header className="page-header">
        <div>
          <h1 className="page-title">{trip.name}</h1>
          <p className="trip-meta">
            {trip.destination} · {formatDate(trip.startDate)} –{' '}
            {formatDate(trip.endDate)}
          </p>
        </div>
        <nav className="trip-links" aria-label="Reise-Bereiche">
          <Link
            className="btn btn--secondary btn--compact"
            to={`/trips/${trip.id}/budget`}
          >
            Budget
          </Link>
          <Link
            className="btn btn--secondary btn--compact"
            to={`/trips/${trip.id}/packing`}
          >
            Packliste
          </Link>
        </nav>
      </header>

      <div className="day-list">
        {dates.map((date) => (
          <DaySection
            key={date}
            date={date}
            activities={trip.activities}
            onAdd={(input) => addActivity(trip.id, input)}
            onUpdate={(activityId, input) =>
              updateActivity(trip.id, activityId, input)
            }
            onDelete={(activityId) => deleteActivity(trip.id, activityId)}
          />
        ))}
      </div>
    </div>
  )
}
