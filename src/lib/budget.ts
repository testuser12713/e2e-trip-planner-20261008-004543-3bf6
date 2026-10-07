import { CATEGORY_ORDER, type Activity, type Category } from '../types'

export interface BudgetAggregation {
  total: number
  perCategory: Record<Category, number>
}

/**
 * Sums the cost of every activity, both overall and per category.
 *
 * Every category is always present in `perCategory` (at 0 when unused), so an
 * empty activity list yields `{ total: 0, perCategory: { ...all 0 } }`.
 * Non-finite costs are treated as 0 to keep the total finite.
 */
export function aggregateBudget(activities: Activity[]): BudgetAggregation {
  const perCategory = {} as Record<Category, number>
  for (const category of CATEGORY_ORDER) {
    perCategory[category] = 0
  }

  let total = 0
  for (const activity of activities) {
    const cost = Number.isFinite(activity.cost) ? activity.cost : 0
    const category: Category = activity.category in perCategory
      ? activity.category
      : 'other'
    perCategory[category] += cost
    total += cost
  }

  return { total, perCategory }
}
