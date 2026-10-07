import { Link, useParams } from 'react-router-dom'
import CategoryBar from '../components/CategoryBar'
import { useTripStore } from '../store/TripStore'
import { aggregateBudget } from '../lib/budget'
import { formatCurrency, formatDate } from '../lib/format'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types'
import '../styles/budget.css'

export default function BudgetPage() {
  const { tripId } = useParams()
  const { getTrip } = useTripStore()

  const trip = tripId ? getTrip(tripId) : undefined

  if (!trip) {
    return (
      <div className="page">
        <Link className="page-back" to="/">
          ← Alle Reisen
        </Link>
        <h1 className="page-title">Budget</h1>
        <p className="budget-notfound">
          Diese Reise wurde nicht gefunden. Zurück zur Reiseübersicht über den
          Link oben.
        </p>
      </div>
    )
  }

  const { total, perCategory } = aggregateBudget(trip.activities)
  const maxAmount = Math.max(
    ...CATEGORY_ORDER.map((category) => perCategory[category]),
  )

  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Alle Reisen
      </Link>

      <header className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="budget-meta">
            {trip.name} · {trip.destination} · {formatDate(trip.startDate)} –{' '}
            {formatDate(trip.endDate)}
          </p>
        </div>
        <Link className="btn btn--secondary btn--compact" to={`/trips/${trip.id}`}>
          Zum Tagesplan
        </Link>
      </header>

      <section className="card" aria-label="Budgetübersicht">
        <div className="budget-total-label">Gesamtsumme</div>
        <div className="budget-total">{formatCurrency(total)}</div>
        <div className="budget-divider" role="presentation" />
        <div className="budget-category-rows">
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
        {total === 0 && (
          <p className="budget-note">
            Für diese Reise sind noch keine Kosten erfasst.
          </p>
        )}
      </section>

      <section className="card budget-chart-card">
        <h2>Kosten nach Kategorie</h2>
        <div className="budget-chart">
          {CATEGORY_ORDER.map((category) => (
            <CategoryBar
              key={category}
              category={category}
              amount={perCategory[category]}
              maxAmount={maxAmount}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
