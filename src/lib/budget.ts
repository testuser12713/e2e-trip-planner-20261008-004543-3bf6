import type { Activity, Category } from '../types'
import { CATEGORY_ORDER } from '../types'

/**
 * Sums the cost of every activity of a trip, once in total and once per
 * category. Every one of the six categories is present in the result, with 0
 * when it is unused. An empty activity list gives a total of 0. A cost that is
 * not finite (NaN, Infinity) counts as 0, so the sums never poison the page.
 */
export function aggregateBudget(activities: Activity[]): {
  total: number
  perCategory: Record<Category, number>
} {
  const perCategory = {} as Record<Category, number>
  for (const category of CATEGORY_ORDER) {
    perCategory[category] = 0
  }

  let total = 0
  for (const activity of activities) {
    const cost = Number.isFinite(activity.cost) ? activity.cost : 0
    if (Object.prototype.hasOwnProperty.call(perCategory, activity.category)) {
      perCategory[activity.category] += cost
    }
    total += cost
  }

  return { total, perCategory }
}
