import { useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import PackingItemRow from '../components/PackingItemRow'
import { formatDate } from '../lib/format'
import { useTripStore } from '../store/TripStore'
import '../styles/packing.css'

const EMPTY_INPUT_ERROR = 'Bitte einen Gegenstand eingeben.'

export default function PackingPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const {
    getTrip,
    addPackingItem,
    togglePackingItem,
    deletePackingItem,
  } = useTripStore()

  const trip = tripId ? getTrip(tripId) : undefined

  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEmpty = value.trim() === ''
  const showError = (touched || submitted) && isEmpty

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!tripId || isEmpty) return
    addPackingItem(tripId, value)
    setValue('')
    setTouched(false)
    setSubmitted(false)
  }

  const backLink = (
    <Link className="page-back" to="/">
      ← Alle Reisen
    </Link>
  )

  if (!trip) {
    return (
      <div className="page">
        {backLink}
        <header className="page-header">
          <h1 className="page-title">Packliste</h1>
        </header>
        <section className="card">
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">
              🧭
            </span>
            <h2 className="empty-state__title">Reise nicht gefunden</h2>
            <p className="empty-state__text">
              Diese Reise existiert nicht mehr. Wähle sie erneut aus deiner
              Übersicht.
            </p>
            <Link className="btn btn--primary" to="/">
              Zur Reiseübersicht
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const total = trip.packing.length
  const packed = trip.packing.filter((item) => item.packed).length
  const percent = total === 0 ? 0 : (packed / total) * 100

  return (
    <div className="page">
      {backLink}
      <header className="page-header">
        <div className="packing-heading">
          <h1 className="page-title">Packliste</h1>
          <p className="packing-meta">
            {trip.destination} · {formatDate(trip.startDate)} –{' '}
            {formatDate(trip.endDate)}
          </p>
        </div>
      </header>

      <section className="card">
        <div className="packing-summary">
          <span className="packing-counter">
            {packed} von {total} gepackt
          </span>
        </div>
        <div className="packing-progress" aria-hidden="true">
          <div
            className="packing-progress__fill"
            style={{ width: `${percent}%` }}
          />
        </div>

        <form className="packing-add" onSubmit={handleSubmit} noValidate>
          <div className="field packing-add__field">
            <label className="field__label" htmlFor="packing-add-input">
              Gegenstand
            </label>
            <input
              ref={inputRef}
              id="packing-add-input"
              className="input"
              type="text"
              placeholder="Gegenstand hinzufügen …"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={showError || undefined}
              aria-describedby={showError ? 'packing-add-error' : undefined}
            />
            {showError && (
              <p className="field__error" id="packing-add-error" role="alert">
                {EMPTY_INPUT_ERROR}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="btn btn--primary packing-add__button"
          >
            Hinzufügen
          </button>
        </form>

        {total === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">
              🧳
            </span>
            <h2 className="empty-state__title">Noch nichts auf der Packliste</h2>
            <p className="empty-state__text">
              Notiere den ersten Gegenstand, den du für diese Reise einpacken
              willst.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => inputRef.current?.focus()}
            >
              Gegenstand hinzufügen
            </button>
          </div>
        ) : (
          <ul className="packing-list">
            {trip.packing.map((item) => (
              <PackingItemRow
                key={item.id}
                item={item}
                onToggle={(itemId) => togglePackingItem(trip.id, itemId)}
                onDelete={(itemId) => deletePackingItem(trip.id, itemId)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
