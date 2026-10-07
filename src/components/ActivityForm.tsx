import { useId, useState, type FormEvent } from 'react'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types'
import type { Activity, ActivityInput, Category } from '../types'
import { validateActivityInput, type ActivityErrors } from '../lib/validation'

/**
 * The activity input as it leaves the form: the ratified contract carries a
 * `date` alongside the shared fields. The date is bound by the day section and
 * is never typed by the user.
 */
export type ActivityDraft = ActivityInput & { date: string }

interface ActivityFormProps {
  date: string
  initial?: Activity
  onSubmit: (input: ActivityDraft) => void
  onCancel: () => void
}

type FieldName = 'title' | 'time' | 'location' | 'cost' | 'category'

export default function ActivityForm({
  date,
  initial,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const baseId = useId()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [time, setTime] = useState(initial?.time ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [cost, setCost] = useState(initial ? String(initial.cost) : '')
  const [category, setCategory] = useState<Category>(initial?.category ?? CATEGORY_ORDER[0])
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    title: false,
    time: false,
    location: false,
    cost: false,
    category: false,
  })
  const [submitted, setSubmitted] = useState(false)

  const costNumber = cost.trim() === '' ? Number.NaN : Number(cost)

  const draft: ActivityDraft = {
    date,
    title: title.trim(),
    time: time.trim(),
    location: location.trim(),
    cost: costNumber,
    category,
  }

  const errors: ActivityErrors = validateActivityInput(draft)

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function errorFor(field: FieldName): string | undefined {
    return touched[field] || submitted ? errors[field] : undefined
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length === 0) {
      onSubmit(draft)
    }
  }

  const fieldId = (field: string) => `${baseId}-${field}`
  const errorId = (field: string) => `${baseId}-${field}-error`

  return (
    <form className="activity-form" onSubmit={handleSubmit} noValidate>
      <div className="activity-form__grid">
        <div className="field">
          <label className="field__label" htmlFor={fieldId('title')}>
            Bezeichnung
          </label>
          <input
            id={fieldId('title')}
            className="input"
            type="text"
            value={title}
            aria-invalid={errorFor('title') ? 'true' : undefined}
            aria-describedby={errorFor('title') ? errorId('title') : undefined}
            onChange={(event) => {
              setTitle(event.target.value)
              markTouched('title')
            }}
            onBlur={() => markTouched('title')}
          />
          {errorFor('title') && (
            <p className="field__error" id={errorId('title')}>
              {errorFor('title')}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={fieldId('time')}>
            Uhrzeit
          </label>
          <input
            id={fieldId('time')}
            className="input"
            type="time"
            value={time}
            aria-invalid={errorFor('time') ? 'true' : undefined}
            aria-describedby={errorFor('time') ? errorId('time') : undefined}
            onChange={(event) => {
              setTime(event.target.value)
              markTouched('time')
            }}
            onBlur={() => markTouched('time')}
          />
          <p className="field__hint">Uhrzeit HH:MM</p>
          {errorFor('time') && (
            <p className="field__error" id={errorId('time')}>
              {errorFor('time')}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={fieldId('location')}>
            Ort
          </label>
          <input
            id={fieldId('location')}
            className="input"
            type="text"
            value={location}
            aria-invalid={errorFor('location') ? 'true' : undefined}
            aria-describedby={
              errorFor('location') ? errorId('location') : undefined
            }
            onChange={(event) => {
              setLocation(event.target.value)
              markTouched('location')
            }}
            onBlur={() => markTouched('location')}
          />
          {errorFor('location') && (
            <p className="field__error" id={errorId('location')}>
              {errorFor('location')}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={fieldId('cost')}>
            Kosten
          </label>
          <input
            id={fieldId('cost')}
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={cost}
            aria-invalid={errorFor('cost') ? 'true' : undefined}
            aria-describedby={errorFor('cost') ? errorId('cost') : undefined}
            onChange={(event) => {
              setCost(event.target.value)
              markTouched('cost')
            }}
            onBlur={() => markTouched('cost')}
          />
          <p className="field__hint">Betrag in Zahlen, ohne Währung</p>
          {errorFor('cost') && (
            <p className="field__error" id={errorId('cost')}>
              {errorFor('cost')}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={fieldId('category')}>
            Kategorie
          </label>
          <select
            id={fieldId('category')}
            className="select"
            value={category}
            aria-invalid={errorFor('category') ? 'true' : undefined}
            aria-describedby={
              errorFor('category') ? errorId('category') : undefined
            }
            onChange={(event) => {
              setCategory(event.target.value as Category)
              markTouched('category')
            }}
            onBlur={() => markTouched('category')}
          >
            {CATEGORY_ORDER.map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
          {errorFor('category') && (
            <p className="field__error" id={errorId('category')}>
              {errorFor('category')}
            </p>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {initial ? 'Speichern' : 'Hinzufügen'}
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
