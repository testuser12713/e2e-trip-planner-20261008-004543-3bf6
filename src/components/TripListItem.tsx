import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { useTripStore } from '../store/TripStore'
import { formatDate } from '../lib/format'
import { validateTripInput } from '../lib/validation'
import type { Trip } from '../types'

interface TripListItemProps {
  trip: Trip
}

/**
 * One trip as a card. The name is a real link to the trip detail; the card
 * also offers inline rename and a confirmed delete.
 */
export default function TripListItem({ trip }: TripListItemProps) {
  const { renameTrip, deleteTrip } = useTripStore()

  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(trip.name)
  const [renameTouched, setRenameTouched] = useState(false)
  const [renameSubmitted, setRenameSubmitted] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const renameInputRef = useRef<HTMLInputElement>(null)
  const deleteTriggerRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus()
  }, [renaming])

  useEffect(() => {
    if (confirming) cancelButtonRef.current?.focus()
  }, [confirming])

  // Reuse the create form's validation so an empty name is reported the same way.
  const renameErrors = validateTripInput({
    name: draft,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
  })
  const nameError =
    renameTouched || renameSubmitted ? renameErrors.name : undefined

  function startRename() {
    setDraft(trip.name)
    setRenameTouched(false)
    setRenameSubmitted(false)
    setRenaming(true)
  }

  function cancelRename() {
    setRenaming(false)
  }

  function saveRename(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    setRenameSubmitted(true)
    if (validateTripInput({ name: draft, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate }).name) {
      return
    }
    renameTrip(trip.id, draft.trim())
    setRenaming(false)
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelRename()
    }
  }

  function startDelete() {
    setConfirming(true)
  }

  function cancelDelete() {
    setConfirming(false)
    deleteTriggerRef.current?.focus()
  }

  function confirmDelete() {
    setConfirming(false)
    deleteTrip(trip.id)
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) cancelDelete()
  }

  function handleOverlayKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') cancelDelete()
  }

  return (
    <article className="trip-card">
      {renaming ? (
        <form className="rename-row" onSubmit={saveRename} noValidate>
          <div className="rename-row__field">
            <input
              id={`rename-${trip.id}`}
              ref={renameInputRef}
              className="input"
              type="text"
              value={draft}
              aria-label="Reisename"
              aria-invalid={nameError ? 'true' : 'false'}
              aria-describedby={
                nameError ? `rename-error-${trip.id}` : undefined
              }
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => setRenameTouched(true)}
              onKeyDown={handleRenameKeyDown}
            />
            {nameError && (
              <p className="field__error" id={`rename-error-${trip.id}`}>
                {nameError}
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
          <Link className="trip-link" to={`/trips/${trip.id}`}>
            <span className="trip-name">{trip.name}</span>
            <span className="trip-meta">
              <span className="trip-meta__loc" aria-hidden="true">
                📍
              </span>
              <span>{trip.destination}</span>
              <span className="trip-meta__sep" aria-hidden="true">
                ·
              </span>
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
              onClick={startDelete}
            >
              Löschen
            </button>
          </div>
        </>
      )}

      {confirming && (
        <div
          className="overlay"
          onClick={handleOverlayClick}
          onKeyDown={handleOverlayKeyDown}
        >
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${trip.id}`}
            aria-describedby={`delete-body-${trip.id}`}
          >
            <h2 id={`delete-title-${trip.id}`} className="dialog__title">
              Reise löschen?
            </h2>
            <p id={`delete-body-${trip.id}`} className="dialog__body">
              „{trip.name}“ wird gelöscht. Auch Aktivitäten, Budgetdaten und die
              Packliste dieser Reise werden entfernt.
            </p>
            <div className="dialog-actions">
              <button
                ref={cancelButtonRef}
                type="button"
                className="btn btn--secondary"
                onClick={cancelDelete}
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
