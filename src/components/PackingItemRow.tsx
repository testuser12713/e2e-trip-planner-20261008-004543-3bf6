import type { PackingItem } from '../types'

interface PackingItemRowProps {
  item: PackingItem
  onToggle: (itemId: string) => void
  onDelete: (itemId: string) => void
}

/**
 * One row of the packing list: a labelled checkbox toggling `packed`, the
 * label text and a delete button. Checked items are struck through AND
 * muted (never colour alone).
 */
export default function PackingItemRow({
  item,
  onToggle,
  onDelete,
}: PackingItemRowProps) {
  return (
    <li
      className={
        item.packed ? 'packing-item packing-item--checked' : 'packing-item'
      }
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
        className="btn btn--danger btn--compact"
        onClick={() => onDelete(item.id)}
      >
        Löschen
      </button>
    </li>
  )
}
