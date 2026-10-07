import { Link, NavLink, useParams } from 'react-router-dom'
import { useTripStore } from '../store/TripStore'
import { eachDateInRange, formatDate } from '../lib/format'
import type { Activity } from '../types'
import DaySection from '../components/DaySection'
import '../styles/trip-detail.css'

function sortByTime(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) =>
    a.time < b.time ? -1 : a.time > b.time ? 1 : 0,
  )
}

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const { getTrip, addActivity, updateActivity, deleteActivity } =
    useTripStore()
  const trip = tripId ? getTrip(tripId) : undefined

  if (!trip) {
    return (
      <div className="page">
        <Link to="/" className="page-back">
          ← Alle Reisen
        </Link>
        <header className="page-header">
          <h1 className="page-title">Tagesplan</h1>
        </header>
        <p className="empty-inline">Diese Reise wurde nicht gefunden.</p>
      </div>
    )
  }

  const dates = eachDateInRange(trip.startDate, trip.endDate)

  return (
    <div className="page">
      <Link to="/" className="page-back">
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
      </header>

      <nav className="trip-tabs" aria-label="Reise-Navigation">
        <NavLink to={`/trips/${trip.id}`} end className="trip-tabs__link">
          Tagesplan
        </NavLink>
        <NavLink
          to={`/trips/${trip.id}/budget`}
          className="trip-tabs__link"
        >
          Budget
        </NavLink>
        <NavLink
          to={`/trips/${trip.id}/packing`}
          className="trip-tabs__link"
        >
          Packliste
        </NavLink>
      </nav>

      <div className="day-list">
        {dates.map((date) => (
          <DaySection
            key={date}
            date={date}
            activities={sortByTime(
              trip.activities.filter((activity) => activity.date === date),
            )}
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
