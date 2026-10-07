export type Category =
  | 'travel'
  | 'accommodation'
  | 'food'
  | 'activity'
  | 'shopping'
  | 'other'

export interface Activity {
  id: string
  /** 'YYYY-MM-DD' — the trip day this activity belongs to. */
  date: string
  title: string
  /** 24h time, 'HH:MM' */
  time: string
  location: string
  cost: number
  category: Category
}

export interface PackingItem {
  id: string
  label: string
  packed: boolean
}

export interface Trip {
  id: string
  name: string
  destination: string
  /** 'YYYY-MM-DD' */
  startDate: string
  /** 'YYYY-MM-DD' */
  endDate: string
  activities: Activity[]
  packing: PackingItem[]
}

export type TripInput = Pick<
  Trip,
  'name' | 'destination' | 'startDate' | 'endDate'
>

export type ActivityInput = Pick<
  Activity,
  'date' | 'title' | 'time' | 'location' | 'cost' | 'category'
>

export const CATEGORY_LABELS: Record<Category, string> = {
  travel: 'Anreise',
  accommodation: 'Unterkunft',
  food: 'Essen',
  activity: 'Aktivität',
  shopping: 'Shopping',
  other: 'Sonstiges',
}

/** Fixed order used by the activity form, the badges and the budget chart. */
export const CATEGORY_ORDER: Category[] = [
  'travel',
  'accommodation',
  'food',
  'activity',
  'shopping',
  'other',
]
