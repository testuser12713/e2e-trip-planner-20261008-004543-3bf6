import { useEffect, useRef, useState } from 'react'
import type { Activity, ActivityInput } from '../types'
import { formatDate, formatWeekday } from '../lib/format'
import ActivityForm, { type ActivityFormValues } from './ActivityForm'
import ActivityRow from './ActivityRow'

type Mode = { type: 'idle' } | { type: 'add' } | { type: 'edit'; id: string }

export interface DaySectionProps {
  date: string
  activities: Activity[]
  onAdd: (input: ActivityInput) => void
  onUpdate: (activityId: string, input: ActivityInput) => void
  onDelete: (activityId: string) => void
}

function toFormValues(activity: Activity): ActivityFormValues {
  return {
    title: activity.title,
    time: activity.time,
    location: activity.location,
    cost: activity.cost,
    category: activity.category,
  }
}

export default function DaySection({
  date,
  activities,
  onAdd,
  onUpdate,
  onDelete,
}: DaySectionProps) {
  const [mode, setMode] = useState<Mode>({ type: 'idle' })
  const [pendingDelete, setPendingDelete] = useState<Activity | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pendingDelete) return
    dialogRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPendingDelete(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pendingDelete])

  const editingId = mode.type === 'edit' ? mode.id : null
  const showForm = mode.type !== 'idle'

  function handleAdd(values: ActivityFormValues) {
    onAdd({ ...values, date, category: values.category || 'other' })
    setMode({ type: 'idle' })
  }

  function handleUpdate(activityId: string, values: ActivityFormValues) {
    onUpdate(activityId, {
      ...values,
      date,
      category: values.category || 'other',
    })
    setMode({ type: 'idle' })
  }

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <article className="card day-card" data-day={date}>
      <div className="day-header">
        <div className="day-title">
          <h2>{formatWeekday(date)}</h2>
          <span className="day-date">{formatDate(date)}</span>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setMode({ type: 'add' })}
        >
          Aktivität hinzufügen
        </button>
      </div>

      <div className="activity-list">
        {mode.type === 'add' && (
          <ActivityForm
            submitLabel="Hinzufügen"
            onSubmit={handleAdd}
            onCancel={() => setMode({ type: 'idle' })}
          />
        )}

        {activities.length === 0 && !showForm ? (
          <p className="empty-inline">
            Noch keine Aktivitäten für diesen Tag
          </p>
        ) : (
          activities.map((activity) =>
            editingId === activity.id ? (
              <ActivityForm
                key={activity.id}
                initialValues={toFormValues(activity)}
                submitLabel="Speichern"
                onSubmit={(values) => handleUpdate(activity.id, values)}
                onCancel={() => setMode({ type: 'idle' })}
              />
            ) : (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onEdit={() => setMode({ type: 'edit', id: activity.id })}
                onDelete={() => setPendingDelete(activity)}
              />
            ),
          )
        )}
      </div>

      {pendingDelete && (
        <div
          className="dialog-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null)
          }}
        >
          <div
            ref={dialogRef}
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-activity-title-${date}`}
            tabIndex={-1}
          >
            <h3 id={`delete-activity-title-${date}`}>Aktivität löschen?</h3>
            <p>
              „{pendingDelete.title}“ wird gelöscht. Die zugehörigen Kosten
              werden ebenfalls entfernt.
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPendingDelete(null)}
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
