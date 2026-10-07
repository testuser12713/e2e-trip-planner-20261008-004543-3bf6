import type { Category } from '../types'
import { CATEGORY_LABELS } from '../types'
import { formatCurrency } from '../lib/format'

interface CategoryBarProps {
  category: Category
  amount: number
  maxAmount: number
}

/**
 * One row of the budget chart: the German category label, a track, and the bar
 * whose length is the category's share of the largest category. The amount is
 * printed as plain text next to the bar (never only a tooltip), so the row
 * stays readable as a label/amount list even if the stylesheet never loads.
 * A maxAmount of 0 keeps every bar at width 0 — no division, no NaN.
 */
export default function CategoryBar({
  category,
  amount,
  maxAmount,
}: CategoryBarProps) {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const safeMax = Number.isFinite(maxAmount) ? maxAmount : 0

  const ratio = safeMax > 0 ? safeAmount / safeMax : 0
  const percentage = ratio > 0 ? Math.min(ratio * 100, 100) : 0
  const positive = percentage > 0

  return (
    <div className="budget-chart__row">
      <span className="budget-chart__label">{CATEGORY_LABELS[category]}</span>
      <div className="budget-chart__track">
        <div
          className={
            positive
              ? 'budget-chart__bar budget-chart__bar--positive'
              : 'budget-chart__bar'
          }
          data-category={category}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="budget-chart__amount">{formatCurrency(safeAmount)}</span>
    </div>
  )
}
