import { useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import PackingItemRow from '../components/PackingItemRow'
import { useTripStore } from '../store/TripStore'
import { formatDate } from '../lib/format'
import '../styles/packing.css'

const ADD_INPUT_ID = 'packing-add-input'
const ADD_ERROR_ID = 'packing-add-error'

export default function PackingPage() {
  const { tripId } = useParams()
  const { getTrip, addPackingItem, togglePackingItem, deletePackingItem } =
    useTripStore()

  const trip = tripId ? getTrip(tripId) : undefined

  const addInputRef = useRef<HTMLInputElement>(null)
  const [label, setLabel] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!trip) {
    return (
      <div className="page">
        <Link className="page-back" to="/">
          ← Alle Reisen
        </Link>
        <h1 className="page-title">Packliste</h1>
        <p className="packing-notfound">
          Diese Reise wurde nicht gefunden. Zurück zur Reiseübersicht über den
          Link oben.
        </p>
      </div>
    )
  }

  const currentTrip = trip
  const total = currentTrip.packing.length
  const packed = currentTrip.packing.filter((item) => item.packed).length
  const progress = total === 0 ? 0 : (packed / total) * 100

  const isEmptyInput = label.trim().length === 0
  const showError = (touched || submitted) && isEmptyInput

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (isEmptyInput) return
    addPackingItem(currentTrip.id, label)
    setLabel('')
    setTouched(false)
    setSubmitted(false)
  }

  return (
    <div className="page">
      <Link className="page-back" to="/">
        ← Alle Reisen
      </Link>

      <header className="page-header">
        <div>
          <h1 className="page-title">Packliste</h1>
          <p className="packing-meta">
            {trip.destination} · {formatDate(trip.startDate)} –{' '}
            {formatDate(trip.endDate)}
          </p>
        </div>
        <nav className="packing-links" aria-label="Reise-Bereiche">
          <Link
            className="btn btn--secondary btn--compact"
            to={`/trips/${trip.id}`}
          >
            Tagesplan
          </Link>
        </nav>
      </header>

      <section className="card packing-card">
        <div className="packing-summary">
          <span className="packing-counter">
            {packed} von {total} gepackt
          </span>
          <div className="packing-progress" aria-hidden="true">
            <div
              className="packing-progress__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form className="packing-add" onSubmit={handleSubmit} noValidate>
          <div className="field packing-add__field">
            <label className="field__label" htmlFor={ADD_INPUT_ID}>
              Gegenstand
            </label>
            <input
              id={ADD_INPUT_ID}
              ref={addInputRef}
              className="input"
              type="text"
              value={label}
              placeholder="Gegenstand hinzufügen …"
              aria-invalid={showError ? 'true' : undefined}
              aria-describedby={showError ? ADD_ERROR_ID : undefined}
              onChange={(event) => {
                setLabel(event.target.value)
                setTouched(true)
              }}
              onBlur={() => setTouched(true)}
            />
            {showError && (
              <p className="field__error" id={ADD_ERROR_ID}>
                Bitte einen Gegenstand eingeben.
              </p>
            )}
          </div>
          <button type="submit" className="btn btn--primary">
            Hinzufügen
          </button>
        </form>

        {total === 0 ? (
          <div className="empty-state packing-empty">
            <div className="empty-state__icon" aria-hidden="true">
              🧳
            </div>
            <h2 className="empty-state__title">Noch nichts eingepackt</h2>
            <p className="empty-state__text">
              Deine Packliste ist noch leer. Füge den ersten Gegenstand hinzu,
              damit unterwegs nichts fehlt.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => addInputRef.current?.focus()}
            >
              Gegenstand hinzufügen
            </button>
          </div>
        ) : (
          <div className="packing-list">
            {trip.packing.map((item) => (
              <PackingItemRow
                key={item.id}
                item={item}
                onToggle={() => togglePackingItem(trip.id, item.id)}
                onDelete={() => deletePackingItem(trip.id, item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
