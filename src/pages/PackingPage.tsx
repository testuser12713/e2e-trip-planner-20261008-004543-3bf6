import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import PackingItemRow from '../components/PackingItemRow'
import { useTripStore } from '../store/TripStore'
import '../styles/packing.css'

const EMPTY_ITEM_ERROR = 'Bitte einen Gegenstand eingeben.'

/**
 * Packing list page: add items through a labelled text field, tick them off
 * (counter 'X von Y gepackt' + accent progress track) and delete them. All
 * state lives in the shared trip store, so every change is persisted to
 * localStorage immediately and survives a reload.
 */
export default function PackingPage() {
  const { tripId = '' } = useParams()
  const { getTrip, addPackingItem, togglePackingItem, deletePackingItem } =
    useTripStore()
  const trip = getTrip(tripId)

  const [label, setLabel] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!trip) {
    return (
      <div className="page">
        <Link className="page-back" to="/">
          ← Alle Reisen
        </Link>
        <header className="page-header">
          <h1 className="page-title">Packliste</h1>
        </header>
        <section className="empty-state" aria-labelledby="packing-missing-title">
          <h2 id="packing-missing-title" className="empty-state__title">
            Reise nicht gefunden
          </h2>
          <p className="empty-state__text">
            Diese Reise existiert nicht (mehr).
          </p>
          <Link className="btn btn--primary" to="/">
            Zu meinen Reisen
          </Link>
        </section>
      </div>
    )
  }

  // Narrowed local, so the closures below keep a non-optional trip.
  const activeTrip = trip
  const total = activeTrip.packing.length
  const packed = activeTrip.packing.filter((item) => item.packed).length
  const percent = total === 0 ? 0 : Math.round((packed / total) * 100)
  const isEmpty = label.trim().length === 0
  const showError = isEmpty && (touched || submitted)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (isEmpty) return
    addPackingItem(activeTrip.id, label)
    setLabel('')
    setTouched(false)
    setSubmitted(false)
  }

  return (
    <div className="page">
      <Link className="page-back" to={`/trips/${activeTrip.id}`}>
        ← Zurück zur Reise
      </Link>

      <header className="page-header">
        <div className="packing-heading">
          <h1 className="page-title">Packliste</h1>
          <p className="packing-meta">
            {activeTrip.name} · {activeTrip.destination}
          </p>
        </div>
      </header>

      <section className="card">
        <div className="packing-summary">
          <span className="packing-counter" aria-live="polite">
            {packed} von {total} gepackt
          </span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Packfortschritt"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={packed}
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>

        <form className="packing-add" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="packing-add-input" className="sr-only">
              Gegenstand
            </label>
            <input
              id="packing-add-input"
              className="input"
              type="text"
              value={label}
              placeholder="Gegenstand hinzufügen …"
              autoComplete="off"
              aria-invalid={showError}
              aria-describedby={showError ? 'packing-add-error' : undefined}
              onChange={(event) => setLabel(event.target.value)}
              onBlur={() => setTouched(true)}
            />
            {showError && (
              <p className="field__error" id="packing-add-error">
                {EMPTY_ITEM_ERROR}
              </p>
            )}
          </div>
          <button type="submit" className="btn btn--primary">
            Hinzufügen
          </button>
        </form>

        {total === 0 ? (
          <section className="empty-state" aria-labelledby="packing-empty-title">
            <div className="empty-state__icon" aria-hidden="true">
              ✓
            </div>
            <h2 id="packing-empty-title" className="empty-state__title">
              Noch nichts auf der Packliste
            </h2>
            <p className="empty-state__text">
              Füge oben den ersten Gegenstand hinzu, den du nicht vergessen
              willst.
            </p>
          </section>
        ) : (
          <ul className="packing-list">
            {activeTrip.packing.map((item) => (
              <PackingItemRow
                key={item.id}
                item={item}
                onToggle={(itemId) => togglePackingItem(activeTrip.id, itemId)}
                onDelete={(itemId) => deletePackingItem(activeTrip.id, itemId)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
