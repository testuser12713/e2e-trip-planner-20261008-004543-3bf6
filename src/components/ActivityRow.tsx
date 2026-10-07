import { CATEGORY_LABELS } from '../types'
import type { Activity } from '../types'
import { formatCurrency } from '../lib/format'

interface ActivityRowProps {
  activity: Activity
  onEdit: () => void
  onDelete: () => void
}

export default function ActivityRow({
  activity,
  onEdit,
  onDelete,
}: ActivityRowProps) {
  return (
    <div className="activity">
      <div className="activity-time">{activity.time}</div>
      <div className="activity-body">
        <div className="activity-titleline">
          <span className="activity-title">{activity.title}</span>
          <span className={`badge badge--${activity.category}`}>
            {CATEGORY_LABELS[activity.category]}
          </span>
        </div>
        <div className="activity-location">{activity.location}</div>
      </div>
      <div className="activity-cost">{formatCurrency(activity.cost)}</div>
      <div className="activity-actions">
        <button
          type="button"
          className="btn btn--ghost btn--compact"
          onClick={onEdit}
        >
          Bearbeiten
        </button>
        <button
          type="button"
          className="btn btn--danger btn--compact"
          onClick={onDelete}
        >
          Löschen
        </button>
      </div>
    </div>
  )
}
