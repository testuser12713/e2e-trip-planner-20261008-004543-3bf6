import type { Activity, Category } from '../types'
import { CATEGORY_ORDER } from '../types'

export interface BudgetAggregate {
  total: number
  perCategory: Record<Category, number>
}

/**
 * Sums the trip's activities into a total and a per-category breakdown.
 *
 * Every one of the six categories is always present in `perCategory`
 * (0 when unused). A non-finite cost counts as 0 so a corrupt stored value
 * can never turn the whole sum into NaN, and an empty activity list yields
 * a total of 0.
 */
export function aggregateBudget(activities: Activity[]): BudgetAggregate {
  const perCategory = {} as Record<Category, number>
  for (const category of CATEGORY_ORDER) {
    perCategory[category] = 0
  }

  let total = 0
  for (const activity of activities) {
    const cost = Number.isFinite(activity.cost) ? activity.cost : 0
    total += cost
    // Guard against a stored activity whose category is not one of the six.
    if (activity.category in perCategory) {
      perCategory[activity.category] += cost
    }
  }

  return { total, perCategory }
}
