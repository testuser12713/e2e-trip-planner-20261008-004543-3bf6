import type { ActivityInput, TripInput } from '../types'

export type TripErrors = Partial<
  Record<'name' | 'destination' | 'startDate' | 'endDate', string>
>

export type ActivityErrors = Partial<
  Record<'title' | 'time' | 'location' | 'cost' | 'category', string>
>

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/

/** Field-local German messages for the trip form. */
export function validateTripInput(input: TripInput): TripErrors {
  const errors: TripErrors = {}

  if (!input.name.trim()) {
    errors.name = 'Bitte einen Reisenamen eingeben.'
  }
  if (!input.destination.trim()) {
    errors.destination = 'Bitte ein Reiseziel eingeben.'
  }

  if (!input.startDate) {
    errors.startDate = 'Bitte ein Startdatum auswählen.'
  } else if (!ISO_DATE.test(input.startDate)) {
    errors.startDate = 'Bitte ein gültiges Startdatum auswählen.'
  }

  if (!input.endDate) {
    errors.endDate = 'Bitte ein Enddatum auswählen.'
  } else if (!ISO_DATE.test(input.endDate)) {
    errors.endDate = 'Bitte ein gültiges Enddatum auswählen.'
  }

  if (
    input.startDate &&
    input.endDate &&
    ISO_DATE.test(input.startDate) &&
    ISO_DATE.test(input.endDate) &&
    input.endDate < input.startDate
  ) {
    errors.endDate = 'Das Enddatum darf nicht vor dem Startdatum liegen.'
  }

  return errors
}

/** Field-local German messages for the activity form. */
export function validateActivityInput(input: ActivityInput): ActivityErrors {
  const errors: ActivityErrors = {}

  if (!input.title.trim()) {
    errors.title = 'Bitte eine Bezeichnung eingeben.'
  }
  if (!input.time.trim()) {
    errors.time = 'Bitte eine Uhrzeit eingeben.'
  } else if (!TIME_24H.test(input.time)) {
    errors.time = 'Bitte die Uhrzeit im Format HH:MM eingeben.'
  }
  if (!input.location.trim()) {
    errors.location = 'Bitte einen Ort eingeben.'
  }
  if (input.cost === null || input.cost === undefined || Number.isNaN(input.cost)) {
    errors.cost = 'Bitte die Kosten eingeben.'
  } else if (input.cost < 0) {
    errors.cost = 'Kosten dürfen nicht negativ sein.'
  }
  if (!input.category) {
    errors.category = 'Bitte eine Kategorie auswählen.'
  }

  return errors
}
