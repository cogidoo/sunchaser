import SunCalc from 'suncalc'

export type SunsetInfo = {
  sunset: Date
  azimuth: number
  cardinal: string
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function getSunsetInfo(date: string, lat: number, lon: number, timeZone: string): SunsetInfo {
  const noon = zonedDateTimeToUtc(date, timeZone, 12)
  const times = SunCalc.getTimes(noon, lat, lon)
  const sunset = times.sunset

  if (Number.isNaN(sunset.getTime())) {
    throw new Error('No sunset is available for this location and date.')
  }

  const position = SunCalc.getPosition(sunset, lat, lon)
  const azimuth = normalizeDegrees((position.azimuth * 180) / Math.PI + 180)

  return {
    sunset,
    azimuth,
    cardinal: toCardinal(azimuth),
  }
}

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

export function toCardinal(degrees: number): string {
  const index = Math.round(normalizeDegrees(degrees) / 45) % CARDINALS.length
  return CARDINALS[index]
}

export function formatDegrees(degrees: number): string {
  return `${degrees.toFixed(1)}°`
}

export function formatSunsetTime(sunset: Date, timeZone: string): string {
  return new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(sunset)
}

export function zonedDateTimeToUtc(date: string, timeZone: string, hour = 0): Date {
  const [year, month, day] = date.split('-').map(Number)
  let utc = new Date(Date.UTC(year, month - 1, day, hour))

  for (let index = 0; index < 3; index += 1) {
    utc = new Date(Date.UTC(year, month - 1, day, hour) - timeZoneOffsetMs(utc, timeZone))
  }

  return utc
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const localAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  )

  return localAsUtc - date.getTime()
}
