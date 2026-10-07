import type { Category } from '../types'
import { CATEGORY_LABELS } from '../types'
import { formatCurrency } from '../lib/format'

export interface CategoryBarProps {
  category: Category
  amount: number
  maxAmount: number
}

/**
 * One chart row of the budget bar chart: German label, track and a bar whose
 * width is the amount's share of the largest category. The row stays readable
 * as a plain label/amount list when the stylesheet is not loaded — the amount
 * is always printed as visible text, never only as a tooltip.
 */
export default function CategoryBar({
  category,
  amount,
  maxAmount,
}: CategoryBarProps) {
  const width =
    Number.isFinite(amount) && amount > 0 && maxAmount > 0
      ? (amount / maxAmount) * 100
      : 0
  const isPositive = width > 0

  return (
    <div className="budget-chart-row">
      <span className="budget-chart-label">{CATEGORY_LABELS[category]}</span>
      <div className="budget-chart-track">
        <div
          className={
            isPositive
              ? 'budget-chart-bar budget-chart-bar--positive'
              : 'budget-chart-bar'
          }
          data-category={category}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="budget-chart-amount">{formatCurrency(amount)}</span>
    </div>
  )
}
