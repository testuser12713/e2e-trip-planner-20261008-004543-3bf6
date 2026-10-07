import { useEffect, useRef, useState } from 'react'
import type { Activity } from '../types'
import { formatDate, formatWeekday } from '../lib/format'
import ActivityForm, { type ActivityDraft } from './ActivityForm'
import ActivityRow from './ActivityRow'

/**
 * The ratified contract stores the day on the activity as `date`
 * ('YYYY-MM-DD'). Read it through this bridge so the page consumes the field
 * the contract ticket adds, without re-declaring the shared type.
 */
type DatedActivity = Activity & { date: string }

function dateOf(activity: Activity): string {
  return (activity as DatedActivity).date
}

interface DaySectionProps {
  date: string
  activities: Activity[]
  onAdd: (input: ActivityDraft) => void
  onUpdate: (activityId: string, input: ActivityDraft) => void
  onDelete: (activityId: string) => void
}

type FormState =
  | { mode: 'add' }
  | { mode: 'edit'; activityId: string }
  | null

export default function DaySection({
  date,
  activities,
  onAdd,
  onUpdate,
  onDelete,
}: DaySectionProps) {
  const [form, setForm] = useState<FormState>(null)
  const [pendingDelete, setPendingDelete] = useState<Activity | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const dayActivities = activities
    .filter((activity) => dateOf(activity) === date)
    .sort((a, b) => a.time.localeCompare(b.time))

  useEffect(() => {
    if (!pendingDelete) return
    cancelRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPendingDelete(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pendingDelete])

  const showForm = form !== null
  const isEmpty = dayActivities.length === 0

  return (
    <article className="day-card" data-day={date}>
      <div className="day-header">
        <div className="day-title">
          <h2 className="day-title__weekday">{formatWeekday(date)}</h2>
          <span className="day-date">{formatDate(date)}</span>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setForm({ mode: 'add' })}
        >
          Aktivität hinzufügen
        </button>
      </div>

      <div className="activity-list">
        {form?.mode === 'add' && (
          <ActivityForm
            date={date}
            onSubmit={(input) => {
              onAdd(input)
              setForm(null)
            }}
            onCancel={() => setForm(null)}
          />
        )}

        {dayActivities.map((activity) =>
          form?.mode === 'edit' && form.activityId === activity.id ? (
            <ActivityForm
              key={activity.id}
              date={date}
              initial={activity}
              onSubmit={(input) => {
                onUpdate(activity.id, input)
                setForm(null)
              }}
              onCancel={() => setForm(null)}
            />
          ) : (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onEdit={() => setForm({ mode: 'edit', activityId: activity.id })}
              onDelete={() => setPendingDelete(activity)}
            />
          ),
        )}

        {isEmpty && !showForm && (
          <p className="empty-inline">Noch keine Aktivitäten für diesen Tag</p>
        )}
      </div>

      {pendingDelete && (
        <div
          className="confirm-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null)
          }}
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${date}`}
          >
            <h2 className="confirm-dialog__title" id={`delete-title-${date}`}>
              Aktivität löschen?
            </h2>
            <p className="confirm-dialog__body">
              „{pendingDelete.title}“ wird gelöscht. Die zugehörigen Kosten
              werden ebenfalls entfernt.
            </p>
            <div className="confirm-dialog__actions">
              <button
                ref={cancelRef}
                type="button"
                className="btn btn--secondary"
                onClick={() => setPendingDelete(null)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="btn btn--danger-solid"
                onClick={() => {
                  onDelete(pendingDelete.id)
                  setPendingDelete(null)
                }}
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
