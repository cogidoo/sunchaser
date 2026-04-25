import SunCalc from 'suncalc'

export type SunsetInfo = {
  sunset: Date
  azimuth: number
  cardinal: string
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function getSunsetInfo(date: string, lat: number, lon: number): SunsetInfo {
  const noon = new Date(`${date}T12:00:00`)
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
