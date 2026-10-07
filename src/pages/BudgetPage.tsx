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
        <Link className="page-back" to="/">
          ← Alle Reisen
        </Link>
        <header className="page-header">
          <h1 className="page-title">Budget</h1>
        </header>
        <section className="card">
          <p className="budget-note">
            Diese Reise wurde nicht gefunden. Bitte wähle eine Reise aus der
            Liste.
          </p>
        </section>
      </div>
    )
  }

  const { total, perCategory } = aggregateBudget(trip.activities)
  const maxAmount = Math.max(0, ...CATEGORY_ORDER.map((c) => perCategory[c]))
  const hasNoCosts = maxAmount === 0

  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Alle Reisen
      </Link>
      <header className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="budget-meta">
            {trip.destination} · {formatDate(trip.startDate)} –{' '}
            {formatDate(trip.endDate)}
          </p>
        </div>
        <Link className="btn btn--secondary" to={`/trips/${trip.id}`}>
          Zum Tagesplan
        </Link>
      </header>

      <section className="card">
        <div className="budget-summary__label">Gesamtsumme</div>
        <div className="budget-summary__total">{formatCurrency(total)}</div>
        <div className="budget-divider" />
        <div className="budget-summary__rows">
          {CATEGORY_ORDER.map((category) => (
            <div className="budget-summary__row" key={category}>
              <span className="budget-summary__category">
                {CATEGORY_LABELS[category]}
              </span>
              <span className="budget-summary__amount">
                {formatCurrency(perCategory[category])}
              </span>
            </div>
          ))}
        </div>
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
        {hasNoCosts && (
          <p className="budget-note">
            Für diese Reise sind noch keine Kosten erfasst.
          </p>
        )}
      </section>
    </div>
  )
}
