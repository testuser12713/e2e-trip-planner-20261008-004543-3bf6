import { useState, type FormEvent } from 'react'
import type { TripInput } from '../types'
import { validateTripInput, type TripErrors } from '../lib/validation'

export interface TripFormProps {
  /** Called with the validated input once the form is submitted. */
  onSubmit: (input: TripInput) => void
  /** Called when the user cancels the form. */
  onCancel: () => void
}

type TripField = keyof TripInput

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

/**
 * Create form for a trip: name, destination and a start/end date pair.
 * Field errors are shown only after the field was touched or the form was
 * submitted (AC-16), never on an untouched form.
 */
export default function TripForm({ onSubmit, onCancel }: TripFormProps) {
  const [values, setValues] = useState<TripInput>(EMPTY_INPUT)
  const [touched, setTouched] = useState<Record<TripField, boolean>>(
    EMPTY_TOUCHED,
  )
  const [submitted, setSubmitted] = useState(false)

  const errors: TripErrors = validateTripInput(values)

  function touch(field: TripField) {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
  }

  function update(field: TripField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    // Typing into a field counts as touching it: its error may now appear.
    touch(field)
  }

  function visibleError(field: TripField): string | undefined {
    if (!submitted && !touched[field]) return undefined
    return errors[field]
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    onSubmit(values)
    setValues(EMPTY_INPUT)
    setTouched(EMPTY_TOUCHED)
    setSubmitted(false)
  }

  const nameError = visibleError('name')
  const destinationError = visibleError('destination')
  const startError = visibleError('startDate')
  const endError = visibleError('endDate')

  return (
    <form
      className="card"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="create-trip-title"
    >
      <h2 id="create-trip-title" style={{ marginBottom: 'var(--space-3)' }}>
        Neue Reise anlegen
      </h2>

      <div className="form-row">
        <div className="field">
          <label className="field__label" htmlFor="trip-name">
            Name
          </label>
          <input
            id="trip-name"
            className="input"
            type="text"
            placeholder="z. B. Sommerurlaub Italien"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'trip-name-error' : undefined}
          />
          {nameError && (
            <p className="field__error" id="trip-name-error">
              {nameError}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="trip-destination">
            Ziel
          </label>
          <input
            id="trip-destination"
            className="input"
            type="text"
            placeholder="z. B. Rom, Italien"
            value={values.destination}
            onChange={(event) => update('destination', event.target.value)}
            aria-invalid={destinationError ? true : undefined}
            aria-describedby={
              destinationError ? 'trip-destination-error' : undefined
            }
          />
          {destinationError && (
            <p className="field__error" id="trip-destination-error">
              {destinationError}
            </p>
          )}
        </div>

        <div className="form-row form-row--two">
          <div className="field">
            <label className="field__label" htmlFor="trip-start">
              Startdatum
            </label>
            <input
              id="trip-start"
              className="input"
              type="date"
              value={values.startDate}
              onChange={(event) => update('startDate', event.target.value)}
              aria-invalid={startError ? true : undefined}
              aria-describedby={
                startError ? 'trip-start-error' : 'trip-start-hint'
              }
            />
            <p className="field__hint" id="trip-start-hint">
              TT.MM.JJJJ
            </p>
            {startError && (
              <p className="field__error" id="trip-start-error">
                {startError}
              </p>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="trip-end">
              Enddatum
            </label>
            <input
              id="trip-end"
              className="input"
              type="date"
              value={values.endDate}
              onChange={(event) => update('endDate', event.target.value)}
              aria-invalid={endError ? true : undefined}
              aria-describedby={
                endError ? 'trip-end-error' : 'trip-end-hint'
              }
            />
            <p className="field__hint" id="trip-end-hint">
              TT.MM.JJJJ
            </p>
            {endError && (
              <p className="field__error" id="trip-end-error">
                {endError}
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
          onClick={onCancel}
        >
          Abbrechen
        </button>
      </div>
    </form>
  )
}
