import { Link, useParams } from 'react-router-dom'
import CategoryBar from '../components/CategoryBar'
import { aggregateBudget } from '../lib/budget'
import { formatCurrency, formatDate } from '../lib/format'
import { useTripStore } from '../store/TripStore'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types'
import '../styles/budget.css'

export default function BudgetPage() {
  const { tripId } = useParams()
  const { getTrip } = useTripStore()
  const trip = tripId ? getTrip(tripId) : undefined

  if (!trip) {
    return (
      <div className="page">
        <Link to="/" className="page-back">
          ← Alle Reisen
        </Link>
        <div className="page-header">
          <h1 className="page-title">Budget</h1>
        </div>
        <section className="card">
          <div className="empty-state">
            <h2 className="empty-state__title">Reise nicht gefunden</h2>
            <p className="empty-state__text">
              Diese Reise existiert nicht (mehr) oder wurde gelöscht.
            </p>
            <Link to="/" className="btn btn--primary">
              Zu den Reisen
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const { total, perCategory } = aggregateBudget(trip.activities)
  const maxCategory = Math.max(
    0,
    ...CATEGORY_ORDER.map((category) => perCategory[category]),
  )
  const isEmpty = total === 0

  return (
    <div className="page">
      <Link to="/" className="page-back">
        ← Alle Reisen
      </Link>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-sub">
            {trip.name} · {trip.destination} · {formatDate(trip.startDate)} –{' '}
            {formatDate(trip.endDate)}
          </p>
        </div>
        <Link
          to={`/trips/${trip.id}`}
          className="btn btn--secondary btn--compact"
        >
          Zum Tagesplan
        </Link>
      </div>

      <section className="card budget-summary">
        <div className="budget-total-label" id="budget-total-label">
          Gesamtsumme
        </div>
        <div className="budget-total" aria-labelledby="budget-total-label">
          {formatCurrency(total)}
        </div>
        <div className="budget-divider" role="separator" />
        <div className="budget-category-list">
          {CATEGORY_ORDER.map((category) => (
            <div className="budget-category-row" key={category}>
              <span className="budget-category-label">
                {CATEGORY_LABELS[category]}
              </span>
              <span className="budget-category-amount">
                {formatCurrency(perCategory[category])}
              </span>
            </div>
          ))}
        </div>
        {isEmpty && (
          <p className="budget-note">
            Für diese Reise sind noch keine Kosten erfasst.
          </p>
        )}
      </section>

      <section className="card">
        <h3 className="chart-title" id="budget-chart-title">
          Kosten nach Kategorie
        </h3>
        <div className="chart" aria-labelledby="budget-chart-title">
          {CATEGORY_ORDER.map((category) => (
            <CategoryBar
              key={category}
              category={category}
              amount={perCategory[category]}
              max={maxCategory}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
