import { CATEGORY_LABELS, type Category } from '../types'
import { formatCurrency } from '../lib/format'

export interface CategoryBarProps {
  category: Category
  /** Sum of this category's activity costs. */
  amount: number
  /** Sum of the largest category — every bar is proportional to it. */
  max: number
}

/**
 * One bar of the budget chart, built from divs and CSS only (no chart
 * library, no canvas). The bar length is the category's share of the largest
 * category; the amount is always printed as text next to it.
 */
export default function CategoryBar({ category, amount, max }: CategoryBarProps) {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const safeMax = Number.isFinite(max) ? max : 0

  // Guard the zero case explicitly: no division by zero, no NaN, 0 width.
  const ratio = safeMax > 0 ? safeAmount / safeMax : 0
  const widthPercent = Math.max(0, Math.min(100, ratio * 100))
  const hasValue = safeAmount > 0

  return (
    <div className="category-bar" data-category={category}>
      <span className="category-bar__label">{CATEGORY_LABELS[category]}</span>
      <div className="category-bar__track" aria-hidden="true">
        <div
          className={`category-bar__fill category-bar__fill--${category}`}
          style={{
            width: `${widthPercent}%`,
            minWidth: hasValue ? '4px' : undefined,
          }}
        />
      </div>
      <span className="category-bar__amount">{formatCurrency(safeAmount)}</span>
    </div>
  )
}
