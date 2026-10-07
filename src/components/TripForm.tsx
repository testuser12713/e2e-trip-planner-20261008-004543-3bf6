import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import type { TripInput } from '../types'
import { validateTripInput, type TripErrors } from '../lib/validation'
import { useTripStore } from '../store/TripStore'

interface TripFormProps {
  /** Called after a successful save and when the user cancels the form. */
  onClose: () => void
}

type FieldName = 'name' | 'destination' | 'startDate' | 'endDate'

const EMPTY_INPUT: TripInput = {
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
}

const UNTOUCHED: Record<FieldName, boolean> = {
  name: false,
  destination: false,
  startDate: false,
  endDate: false,
}

/**
 * Create form for a trip. It owns its own field state, reads the store only
 * through `createTrip`, and closes itself once a trip was persisted.
 */
export default function TripForm({ onClose }: TripFormProps) {
  const { createTrip } = useTripStore()
  const baseId = useId()
  const [values, setValues] = useState<TripInput>(EMPTY_INPUT)
  const [touched, setTouched] = useState<Record<FieldName, boolean>>(UNTOUCHED)
  const [submitted, setSubmitted] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const errors: TripErrors = validateTripInput(values)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  function markTouched(field: FieldName) {
    setTouched((current) =>
      current[field] ? current : { ...current, [field]: true },
    )
  }

  function setField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function errorFor(field: FieldName): string | undefined {
    return touched[field] || submitted ? errors[field] : undefined
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    createTrip(values)
    onClose()
  }

  const fieldId = (field: FieldName) => `${baseId}-${field}`
  const errorId = (field: FieldName) => `${baseId}-${field}-error`
  const titleId = `${baseId}-title`

  return (
    <div
      className="trip-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <form
        className="trip-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        noValidate
      >
        <h2 id={titleId} className="trip-dialog__title">
          Neue Reise anlegen
        </h2>

        <div className="field">
          <label className="field__label" htmlFor={fieldId('name')}>
            Name
          </label>
          <input
            id={fieldId('name')}
            ref={nameRef}
            className="input"
            type="text"
            value={values.name}
            aria-invalid={errorFor('name') ? 'true' : undefined}
            aria-describedby={errorFor('name') ? errorId('name') : undefined}
            onChange={(event) => {
              setField('name', event.target.value)
              markTouched('name')
            }}
            onBlur={() => markTouched('name')}
          />
          {errorFor('name') && (
            <p className="field__error" id={errorId('name')}>
              {errorFor('name')}
            </p>
          )}
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor={fieldId('destination')}>
              Reiseziel
            </label>
            <input
              id={fieldId('destination')}
              className="input"
              type="text"
              value={values.destination}
              aria-invalid={errorFor('destination') ? 'true' : undefined}
              aria-describedby={
                errorFor('destination') ? errorId('destination') : undefined
              }
              onChange={(event) => {
                setField('destination', event.target.value)
                markTouched('destination')
              }}
              onBlur={() => markTouched('destination')}
            />
            {errorFor('destination') && (
              <p className="field__error" id={errorId('destination')}>
                {errorFor('destination')}
              </p>
            )}
          </div>
        </div>

        <div className="form-row form-row--two">
          <div className="field">
            <label className="field__label" htmlFor={fieldId('startDate')}>
              Startdatum
            </label>
            <input
              id={fieldId('startDate')}
              className="input"
              type="date"
              value={values.startDate}
              aria-invalid={errorFor('startDate') ? 'true' : undefined}
              aria-describedby={
                errorFor('startDate') ? errorId('startDate') : undefined
              }
              onChange={(event) => {
                setField('startDate', event.target.value)
                markTouched('startDate')
              }}
              onBlur={() => markTouched('startDate')}
            />
            <p className="field__hint">TT.MM.JJJJ</p>
            {errorFor('startDate') && (
              <p className="field__error" id={errorId('startDate')}>
                {errorFor('startDate')}
              </p>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={fieldId('endDate')}>
              Enddatum
            </label>
            <input
              id={fieldId('endDate')}
              className="input"
              type="date"
              value={values.endDate}
              aria-invalid={errorFor('endDate') ? 'true' : undefined}
              aria-describedby={
                errorFor('endDate') ? errorId('endDate') : undefined
              }
              onChange={(event) => {
                setField('endDate', event.target.value)
                markTouched('endDate')
              }}
              onBlur={() => markTouched('endDate')}
            />
            <p className="field__hint">TT.MM.JJJJ</p>
            {errorFor('endDate') && (
              <p className="field__error" id={errorId('endDate')}>
                {errorFor('endDate')}
              </p>
            )}
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
