import tzLookup from 'tz-lookup'

type TimeZoneLookup = (lat: number, lon: number) => string

export type LocationTimeZone = {
  timeZone: string
  isFallback: boolean
}

export function resolveLocationTimeZone(lat: number, lon: number, lookup: TimeZoneLookup = tzLookup): LocationTimeZone {
  try {
    return { timeZone: lookup(lat, lon), isFallback: false }
  } catch {
    return { timeZone: browserTimeZone(), isFallback: true }
  }
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function formatTimeZoneLabel(value: LocationTimeZone): string {
  return value.isFallback ? `${value.timeZone} (Browser-Fallback)` : value.timeZone
}
