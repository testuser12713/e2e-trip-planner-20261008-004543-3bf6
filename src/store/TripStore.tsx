import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Activity, ActivityInput, PackingItem, Trip, TripInput } from '../types'
import { loadTrips, saveTrips } from '../storage'

export interface TripStoreValue {
  trips: Trip[]
  getTrip: (id: string) => Trip | undefined
  createTrip: (input: TripInput) => Trip
  renameTrip: (id: string, name: string) => void
  deleteTrip: (id: string) => void
  addActivity: (tripId: string, input: ActivityInput) => void
  updateActivity: (
    tripId: string,
    activityId: string,
    input: ActivityInput,
  ) => void
  deleteActivity: (tripId: string, activityId: string) => void
  addPackingItem: (tripId: string, label: string) => void
  togglePackingItem: (tripId: string, itemId: string) => void
  deletePackingItem: (tripId: string, itemId: string) => void
}

const TripStoreContext = createContext<TripStoreValue | null>(null)

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function TripStoreProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips())
  const tripsRef = useRef<Trip[]>(trips)

  const commit = useCallback((next: Trip[]) => {
    tripsRef.current = next
    saveTrips(next)
    setTrips(next)
  }, [])

  const getTrip = useCallback(
    (id: string): Trip | undefined => tripsRef.current.find((trip) => trip.id === id),
    [],
  )

  const createTrip = useCallback(
    (input: TripInput): Trip => {
      const trip: Trip = {
        id: newId(),
        name: input.name,
        destination: input.destination,
        startDate: input.startDate,
        endDate: input.endDate,
        activities: [],
        packing: [],
      }
      commit([...tripsRef.current, trip])
      return trip
    },
    [commit],
  )

  const renameTrip = useCallback(
    (id: string, name: string) => {
      commit(
        tripsRef.current.map((trip) =>
          trip.id === id ? { ...trip, name } : trip,
        ),
      )
    },
    [commit],
  )

  const deleteTrip = useCallback(
    (id: string) => {
      // Activities and packing items live inside the trip, so removing the
      // trip removes them together with it.
      commit(tripsRef.current.filter((trip) => trip.id !== id))
    },
    [commit],
  )

  const addActivity = useCallback(
    (tripId: string, input: ActivityInput) => {
      const activity: Activity = { id: newId(), ...input }
      commit(
        tripsRef.current.map((trip) =>
          trip.id === tripId
            ? { ...trip, activities: [...trip.activities, activity] }
            : trip,
        ),
      )
    },
    [commit],
  )

  const updateActivity = useCallback(
    (tripId: string, activityId: string, input: ActivityInput) => {
      commit(
        tripsRef.current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                activities: trip.activities.map((activity) =>
                  activity.id === activityId
                    ? { ...activity, ...input }
                    : activity,
                ),
              }
            : trip,
        ),
      )
    },
    [commit],
  )

  const deleteActivity = useCallback(
    (tripId: string, activityId: string) => {
      commit(
        tripsRef.current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                activities: trip.activities.filter(
                  (activity) => activity.id !== activityId,
                ),
              }
            : trip,
        ),
      )
    },
    [commit],
  )

  const addPackingItem = useCallback(
    (tripId: string, label: string) => {
      const trimmed = label.trim()
      if (!trimmed) return
      const item: PackingItem = { id: newId(), label: trimmed, packed: false }
      commit(
        tripsRef.current.map((trip) =>
          trip.id === tripId
            ? { ...trip, packing: [...trip.packing, item] }
            : trip,
        ),
      )
    },
    [commit],
  )

  const togglePackingItem = useCallback(
    (tripId: string, itemId: string) => {
      commit(
        tripsRef.current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                packing: trip.packing.map((item) =>
                  item.id === itemId ? { ...item, packed: !item.packed } : item,
                ),
              }
            : trip,
        ),
      )
    },
    [commit],
  )

  const deletePackingItem = useCallback(
    (tripId: string, itemId: string) => {
      commit(
        tripsRef.current.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                packing: trip.packing.filter((item) => item.id !== itemId),
              }
            : trip,
        ),
      )
    },
    [commit],
  )

  const value = useMemo<TripStoreValue>(
    () => ({
      trips,
      getTrip,
      createTrip,
      renameTrip,
      deleteTrip,
      addActivity,
      updateActivity,
      deleteActivity,
      addPackingItem,
      togglePackingItem,
      deletePackingItem,
    }),
    [
      trips,
      getTrip,
      createTrip,
      renameTrip,
      deleteTrip,
      addActivity,
      updateActivity,
      deleteActivity,
      addPackingItem,
      togglePackingItem,
      deletePackingItem,
    ],
  )

  return (
    <TripStoreContext.Provider value={value}>
      {children}
    </TripStoreContext.Provider>
  )
}

export function useTripStore(): TripStoreValue {
  const context = useContext(TripStoreContext)
  if (!context) {
    throw new Error('useTripStore must be used inside a TripStoreProvider')
  }
  return context
}
