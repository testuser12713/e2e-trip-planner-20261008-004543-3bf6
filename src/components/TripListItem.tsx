import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Link } from 'react-router-dom'
import type { Trip } from '../types'
import { useTripStore } from '../store/TripStore'
import { formatDate } from '../lib/format'
import { validateTripInput } from '../lib/validation'

export interface TripListItemProps {
  trip: Trip
}

/**
 * One trip card: the name is a real link to '/trips/<id>', the title can be
 * renamed inline, and deleting asks for confirmation first.
 */
export default function TripListItem({ trip }: TripListItemProps) {
  const { renameTrip, deleteTrip } = useTripStore()

  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(trip.name)
  const [renameTouched, setRenameTouched] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const cancelRef = useRef<HTMLButtonElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

  // Reuse the create form's validation so the message is identical.
  const nameError = validateTripInput({
    name: draft,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
  }).name
  const visibleNameError = renameTouched ? nameError : undefined

  useEffect(() => {
    if (!confirmOpen) return
    cancelRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setConfirmOpen(false)
        deleteButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [confirmOpen])

  function startRename() {
    setDraft(trip.name)
    setRenameTouched(false)
    setRenaming(true)
  }

  function cancelRename() {
    setRenaming(false)
    setDraft(trip.name)
    setRenameTouched(false)
  }

  function saveRename(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    setRenameTouched(true)
    if (nameError) return
    renameTrip(trip.id, draft.trim())
    setRenaming(false)
  }

  function onRenameKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelRename()
    }
  }

  function closeConfirm() {
    setConfirmOpen(false)
    deleteButtonRef.current?.focus()
  }

  function confirmDelete() {
    deleteTrip(trip.id)
    setConfirmOpen(false)
  }

  const period = `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`

  return (
    <li className="trip-list__item">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          minHeight: 64,
          padding: 'var(--space-2) var(--space-3)',
        }}
      >
        {renaming ? (
          <form
            onSubmit={saveRename}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              gap: 'var(--space-1)',
              flex: '1 1 220px',
              minWidth: 0,
            }}
          >
            <div
              className="field"
              style={{ flex: '1 1 160px', minWidth: 0 }}
            >
              <label className="field__label" htmlFor={`trip-rename-${trip.id}`}>
                Name
              </label>
              <input
                id={`trip-rename-${trip.id}`}
                className="input"
                type="text"
                value={draft}
                autoFocus
                onChange={(event) => {
                  setDraft(event.target.value)
                  setRenameTouched(true)
                }}
                onKeyDown={onRenameKeyDown}
                aria-invalid={visibleNameError ? true : undefined}
                aria-describedby={
                  visibleNameError ? `trip-rename-error-${trip.id}` : undefined
                }
              />
              {visibleNameError && (
                <p
                  className="field__error"
                  id={`trip-rename-error-${trip.id}`}
                >
                  {visibleNameError}
                </p>
              )}
            </div>
            <button type="submit" className="btn btn--primary btn--compact">
              Speichern
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--compact"
              onClick={cancelRename}
            >
              Abbrechen
            </button>
          </form>
        ) : (
          <>
            <Link
              className="trip-list__link"
              to={`/trips/${trip.id}`}
              style={{
                padding: 0,
                minHeight: 0,
                flex: '1 1 180px',
                minWidth: 0,
              }}
            >
              <span className="trip-list__name">{trip.name}</span>
              <span className="trip-list__meta">
                <span aria-hidden="true">📍</span> {trip.destination} · {period}
              </span>
            </Link>
            <div style={{ display: 'flex', gap: 'var(--space-0)' }}>
              <button
                type="button"
                className="btn btn--ghost btn--compact"
                onClick={startRename}
              >
                Umbenennen
              </button>
              <button
                ref={deleteButtonRef}
                type="button"
                className="btn btn--danger btn--compact"
                onClick={() => setConfirmOpen(true)}
              >
                Löschen
              </button>
            </div>
          </>
        )}
      </div>

      {confirmOpen && (
        <div
          role="presentation"
          onClick={closeConfirm}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2)',
            background: 'var(--color-overlay)',
            zIndex: 50,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`trip-delete-title-${trip.id}`}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              padding: 'var(--space-3)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 30px rgba(27, 36, 48, 0.18)',
            }}
          >
            <h2
              id={`trip-delete-title-${trip.id}`}
              style={{
                fontSize: 'var(--size-h2)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Reise löschen?
            </h2>
            <p style={{ marginBottom: 'var(--space-3)' }}>
              „{trip.name}“ wird gelöscht. Auch Aktivitäten, Budgetdaten und die
              Packliste dieser Reise werden entfernt.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: 'var(--space-1)',
              }}
            >
              <button
                ref={cancelRef}
                type="button"
                className="btn btn--secondary"
                onClick={closeConfirm}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="btn btn--danger-solid"
                onClick={confirmDelete}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}
