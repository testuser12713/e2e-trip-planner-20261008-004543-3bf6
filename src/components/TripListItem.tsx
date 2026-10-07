import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Trip } from '../types'
import { formatDate } from '../lib/format'
import { validateTripInput } from '../lib/validation'
import { useTripStore } from '../store/TripStore'

interface TripListItemProps {
  trip: Trip
}

/**
 * One trip card: the whole card is a link to the trip detail, with inline
 * rename and a confirmed delete. All mutations go through the store.
 */
export default function TripListItem({ trip }: TripListItemProps) {
  const { renameTrip, deleteTrip } = useTripStore()

  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(trip.name)
  const [renameSubmitted, setRenameSubmitted] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const renameInputRef = useRef<HTMLInputElement>(null)
  const deleteTriggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (renaming) {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }
  }, [renaming])

  useEffect(() => {
    if (confirmOpen) dialogRef.current?.focus()
  }, [confirmOpen])

  const renameErrors = validateTripInput({
    name: nameDraft,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
  })
  const renameError = renameSubmitted ? renameErrors.name : undefined

  function startRename() {
    setNameDraft(trip.name)
    setRenameSubmitted(false)
    setRenaming(true)
  }

  function commitRename() {
    setRenameSubmitted(true)
    const name = nameDraft.trim()
    if (!name) return
    renameTrip(trip.id, name)
    setRenaming(false)
  }

  function cancelRename() {
    setRenaming(false)
  }

  function closeConfirm() {
    setConfirmOpen(false)
    deleteTriggerRef.current?.focus()
  }

  function confirmDelete() {
    deleteTrip(trip.id)
    setConfirmOpen(false)
  }

  return (
    <article className="trip-card">
      {renaming ? (
        <div className="trip-rename">
          <div className="field trip-rename__field">
            <label className="field__label" htmlFor={`rename-${trip.id}`}>
              Reisename
            </label>
            <input
              id={`rename-${trip.id}`}
              ref={renameInputRef}
              className="input"
              type="text"
              value={nameDraft}
              aria-invalid={renameError ? 'true' : undefined}
              aria-describedby={
                renameError ? `rename-${trip.id}-error` : undefined
              }
              onChange={(event) => {
                setNameDraft(event.target.value)
                setRenameSubmitted(false)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitRename()
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelRename()
                }
              }}
            />
            {renameError && (
              <p className="field__error" id={`rename-${trip.id}-error`}>
                {renameError}
              </p>
            )}
          </div>
          <div className="trip-rename__actions">
            <button
              type="button"
              className="btn btn--primary btn--compact"
              onClick={commitRename}
            >
              Speichern
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--compact"
              onClick={cancelRename}
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <>
          <Link to={`/trips/${trip.id}`} className="trip-link">
            <span className="trip-link__name">{trip.name}</span>
            <span className="trip-link__meta">
              <span className="trip-link__loc" aria-hidden="true">
                📍
              </span>
              <span>{trip.destination}</span>
              <span aria-hidden="true">·</span>
              <span>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
            </span>
          </Link>

          <div className="trip-actions">
            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={startRename}
            >
              Umbenennen
            </button>
            <button
              ref={deleteTriggerRef}
              type="button"
              className="btn btn--danger btn--compact"
              onClick={() => setConfirmOpen(true)}
            >
              Löschen
            </button>
          </div>
        </>
      )}

      {confirmOpen && (
        <div
          className="trip-confirm-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeConfirm()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeConfirm()
          }}
        >
          <div
            ref={dialogRef}
            className="trip-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-${trip.id}-title`}
            tabIndex={-1}
          >
            <h2
              id={`delete-${trip.id}-title`}
              className="trip-confirm-dialog__title"
            >
              Reise löschen?
            </h2>
            <p className="trip-confirm-dialog__body">
              „{trip.name}“ wird gelöscht. Auch die Aktivitäten, die Budgetdaten
              und die Packliste dieser Reise werden entfernt.
            </p>
            <div className="trip-confirm-dialog__actions">
              <button
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
    </article>
  )
}
