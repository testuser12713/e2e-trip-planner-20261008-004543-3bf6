import { useId, useState, type FormEvent } from 'react'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ActivityInput,
  type Category,
} from '../types'
import { validateActivityInput } from '../lib/validation'

/** The five user-entered fields; the day/date is supplied by the day section. */
export type ActivityFormValues = Omit<ActivityInput, 'date' | 'category'> & {
  category: Category | ''
}

type FieldName = keyof ActivityFormValues

export interface ActivityFormProps {
  /** Pre-filled values when editing; omitted when adding. */
  initialValues?: Partial<ActivityFormValues>
  submitLabel: string
  onSubmit: (values: ActivityFormValues) => void
  onCancel: () => void
}

const EMPTY: ActivityFormValues = {
  title: '',
  time: '',
  location: '',
  cost: Number.NaN,
  category: '',
}

/** Keeps the raw text of the numeric cost field so an empty input stays empty. */
function toCostText(cost: number | undefined): string {
  return cost === undefined || Number.isNaN(cost) ? '' : String(cost)
}

export default function ActivityForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const uid = useId()
  const [values, setValues] = useState<ActivityFormValues>({
    ...EMPTY,
    ...initialValues,
  })
  const [costText, setCostText] = useState(() =>
    toCostText(initialValues?.cost),
  )
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    title: false,
    time: false,
    location: false,
    cost: false,
    category: false,
  })
  const [submitted, setSubmitted] = useState(false)

  const errors = validateActivityInput({ ...values, date: '' } as ActivityInput)
  const showError = (field: FieldName): string | undefined =>
    touched[field] || submitted ? errors[field] : undefined

  function fieldId(field: FieldName): string {
    return `${uid}-${field}`
  }

  function errorId(field: FieldName): string {
    return `${uid}-${field}-error`
  }

  function markTouched(field: FieldName) {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
  }

  function setField<K extends FieldName>(field: K, value: ActivityFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
    markTouched(field)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    onSubmit(values)
  }

  return (
    <form className="activity-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row form-row--two">
        <div className="field">
          <label className="field__label" htmlFor={fieldId('title')}>
            Bezeichnung
          </label>
          <input
            id={fieldId('title')}
            className="input"
            type="text"
            value={values.title}
            onChange={(event) => setField('title', event.target.value)}
            aria-invalid={showError('title') ? 'true' : undefined}
            aria-describedby={showError('title') ? errorId('title') : undefined}
          />
          {showError('title') && (
            <p className="field__error" id={errorId('title')}>
              {errors.title}
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
            value={values.time}
            onChange={(event) => setField('time', event.target.value)}
            aria-invalid={showError('time') ? 'true' : undefined}
            aria-describedby={showError('time') ? errorId('time') : undefined}
          />
          {showError('time') && (
            <p className="field__error" id={errorId('time')}>
              {errors.time}
            </p>
          )}
        </div>
      </div>

      <div className="form-row form-row--two">
        <div className="field">
          <label className="field__label" htmlFor={fieldId('location')}>
            Ort
          </label>
          <input
            id={fieldId('location')}
            className="input"
            type="text"
            value={values.location}
            onChange={(event) => setField('location', event.target.value)}
            aria-invalid={showError('location') ? 'true' : undefined}
            aria-describedby={
              showError('location') ? errorId('location') : undefined
            }
          />
          {showError('location') && (
            <p className="field__error" id={errorId('location')}>
              {errors.location}
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
            value={costText}
            onChange={(event) => {
              const text = event.target.value
              setCostText(text)
              setField('cost', text === '' ? Number.NaN : Number(text))
            }}
            aria-invalid={showError('cost') ? 'true' : undefined}
            aria-describedby={showError('cost') ? errorId('cost') : undefined}
          />
          <p className="field__hint">Betrag in Zahlen, ohne Währung</p>
          {showError('cost') && (
            <p className="field__error" id={errorId('cost')}>
              {errors.cost}
            </p>
          )}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor={fieldId('category')}>
          Kategorie
        </label>
        <select
          id={fieldId('category')}
          className="select"
          value={values.category}
          onChange={(event) =>
            setField('category', event.target.value as Category)
          }
          aria-invalid={showError('category') ? 'true' : undefined}
          aria-describedby={
            showError('category') ? errorId('category') : undefined
          }
        >
          <option value="">Bitte wählen</option>
          {CATEGORY_ORDER.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        {showError('category') && (
          <p className="field__error" id={errorId('category')}>
            {errors.category}
          </p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
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
