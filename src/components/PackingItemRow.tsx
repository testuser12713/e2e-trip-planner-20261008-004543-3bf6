import type { PackingItem } from '../types'

interface PackingItemRowProps {
  item: PackingItem
  onToggle: () => void
  onDelete: () => void
}

/**
 * One row of the packing list. The checkbox is labelled by the item's own
 * label (accessible name = the label), sits in a >=44px hit area, and the
 * delete button is a danger-ghost placed at the end of the row. A packed item
 * is marked by line-through AND a muted colour AND the checkbox state — never
 * by colour alone. Every row keeps the same structure so neighbours stay
 * distinguishable.
 */
export default function PackingItemRow({
  item,
  onToggle,
  onDelete,
}: PackingItemRowProps) {
  return (
    <div className={`packing-item${item.packed ? ' packing-item--checked' : ''}`}>
      <label className="packing-item__label">
        <input
          type="checkbox"
          className="packing-item__checkbox"
          checked={item.packed}
          onChange={onToggle}
        />
        <span className="packing-item__text">{item.label}</span>
      </label>
      <button
        type="button"
        className="btn btn--danger btn--compact packing-item__delete"
        onClick={onDelete}
      >
        Löschen
      </button>
    </div>
  )
}
