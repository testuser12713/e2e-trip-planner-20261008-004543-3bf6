import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { useTripStore } from '../store/TripStore'
import { validateTripInput } from '../lib/validation'
import type { TripInput } from '../types'

type TripField = 'name' | 'destination' | 'startDate' | 'endDate'

const EMPTY_INPUT: TripInput = {
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
}

const EMPTY_TOUCHED: Record<TripField, boolean> = {
  name: false,
  destination: false,
  startDate: false,
  endDate: false,
}

interface TripFormProps {
  /** Closes the form; called after a successful save and on cancel. */
  onClose: () => void
}

/**
 * Create form for a new trip. It owns its own draft state, validates through
 * validateTripInput and writes through the store — the page passes no data in.
 */
export default function TripForm({ onClose }: TripFormProps) {
  const { createTrip } = useTripStore()
  const [values, setValues] = useState<TripInput>(EMPTY_INPUT)
  const [touched, setTouched] = useState<Record<TripField, boolean>>(
    EMPTY_TOUCHED,
  )
  const [submitted, setSubmitted] = useState(false)

  const errors = validateTripInput(values)

  function errorFor(field: TripField): string | undefined {
    return touched[field] || submitted ? errors[field] : undefined
  }

  function update(field: TripField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function markTouched(field: TripField) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validateTripInput(values)).length > 0) return

    createTrip({
      name: values.name.trim(),
      destination: values.destination.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
    })
    onClose()
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') onClose()
  }

  return (
    <div
      className="overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-form-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <h2 id="trip-form-title" className="dialog__title">
          Neue Reise anlegen
        </h2>

        <div className="trip-form__fields">
          <div className="field">
            <label htmlFor="trip-name" className="field__label">
              Name
            </label>
            <input
              id="trip-name"
              className="input"
              type="text"
              value={values.name}
              placeholder="z. B. Sommerurlaub Italien"
              aria-invalid={errorFor('name') ? 'true' : 'false'}
              aria-describedby={errorFor('name') ? 'trip-name-error' : undefined}
              onChange={(event) => update('name', event.target.value)}
              onBlur={() => markTouched('name')}
            />
            {errorFor('name') && (
              <p className="field__error" id="trip-name-error">
                {errorFor('name')}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="trip-destination" className="field__label">
              Reiseziel
            </label>
            <input
              id="trip-destination"
              className="input"
              type="text"
              value={values.destination}
              placeholder="z. B. Rom, Italien"
              aria-invalid={errorFor('destination') ? 'true' : 'false'}
              aria-describedby={
                errorFor('destination') ? 'trip-destination-error' : undefined
              }
              onChange={(event) => update('destination', event.target.value)}
              onBlur={() => markTouched('destination')}
            />
            {errorFor('destination') && (
              <p className="field__error" id="trip-destination-error">
                {errorFor('destination')}
              </p>
            )}
          </div>

          <div className="form-row form-row--two">
            <div className="field">
              <label htmlFor="trip-start" className="field__label">
                Startdatum
              </label>
              <input
                id="trip-start"
                className="input"
                type="date"
                value={values.startDate}
                aria-invalid={errorFor('startDate') ? 'true' : 'false'}
                aria-describedby={
                  errorFor('startDate') ? 'trip-start-error' : undefined
                }
                onChange={(event) => update('startDate', event.target.value)}
                onBlur={() => markTouched('startDate')}
              />
              <p className="field__hint">TT.MM.JJJJ</p>
              {errorFor('startDate') && (
                <p className="field__error" id="trip-start-error">
                  {errorFor('startDate')}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="trip-end" className="field__label">
                Enddatum
              </label>
              <input
                id="trip-end"
                className="input"
                type="date"
                value={values.endDate}
                aria-invalid={errorFor('endDate') ? 'true' : 'false'}
                aria-describedby={
                  errorFor('endDate') ? 'trip-end-error' : undefined
                }
                onChange={(event) => update('endDate', event.target.value)}
                onBlur={() => markTouched('endDate')}
              />
              <p className="field__hint">TT.MM.JJJJ</p>
              {errorFor('endDate') && (
                <p className="field__error" id="trip-end-error">
                  {errorFor('endDate')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            Speichern
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
}
