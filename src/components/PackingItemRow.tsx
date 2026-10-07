import type { PackingItem } from '../types'

export interface PackingItemRowProps {
  item: PackingItem
  onToggle: (itemId: string) => void
  onDelete: (itemId: string) => void
}

/**
 * One packing list row: a labelled checkbox toggling the packed state, the
 * label text, and a per-row delete button. A checked item is marked by
 * strike-through AND a muted colour AND the checkbox state — never colour
 * alone. Every row keeps the same structure so neighbours stay
 * distinguishable.
 */
export default function PackingItemRow({
  item,
  onToggle,
  onDelete,
}: PackingItemRowProps) {
  return (
    <li
      className={`packing-item${item.packed ? ' packing-item--checked' : ''}`}
    >
      <label className="packing-item__label">
        <input
          type="checkbox"
          className="packing-item__checkbox"
          checked={item.packed}
          onChange={() => onToggle(item.id)}
        />
        <span className="packing-item__text">{item.label}</span>
      </label>
      <button
        type="button"
        className="btn btn--danger btn--compact packing-item__delete"
        onClick={() => onDelete(item.id)}
      >
        Löschen
      </button>
    </li>
  )
}
