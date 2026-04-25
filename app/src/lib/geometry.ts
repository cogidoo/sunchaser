import { normalizeDegrees } from './sun'

export type Coordinate = [number, number]

export type AlignmentClass = 'excellent' | 'good' | 'fair'

export type StreetSegment = {
  id: string
  name: string
  coordinates: Coordinate[]
  bearing: number
  matchedBearing: number
  deviation: number
  lengthMeters: number
  alignmentClass: AlignmentClass
}

type SegmentRun = {
  id: string
  name: string
  coordinates: Coordinate[]
  bearingX: number
  bearingY: number
  matchedBearingX: number
  matchedBearingY: number
  lengthMeters: number
}

const EARTH_RADIUS_METERS = 6_371_000
const MIN_SEGMENT_LENGTH_METERS = 35
const MAX_MERGE_BEARING_DEVIATION = 7
const MAX_CROSS_WAY_GAP_METERS = 3
const MIN_EXCELLENT_LENGTH_METERS = 80
const MIN_GOOD_LENGTH_METERS = 120
const MIN_FAIR_LENGTH_METERS = 180

export function bearingDegrees(from: Coordinate, to: Coordinate): number {
  const [lon1, lat1] = from.map(toRadians)
  const [lon2, lat2] = to.map(toRadians)
  const deltaLon = lon2 - lon1
  const y = Math.sin(deltaLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon)

  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI)
}

export function distanceMeters(from: Coordinate, to: Coordinate): number {
  const [lon1, lat1] = from.map(toRadians)
  const [lon2, lat2] = to.map(toRadians)
  const deltaLat = lat2 - lat1
  const deltaLon = lon2 - lon1
  const a =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function angularDeviation(a: number, b: number): number {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b))
  return Math.min(diff, 360 - diff)
}

export function classifyDeviation(deviation: number): AlignmentClass | null {
  if (deviation <= 2) {
    return 'excellent'
  }

  if (deviation <= 5) {
    return 'good'
  }

  if (deviation <= 10) {
    return 'fair'
  }

  return null
}

export function buildAlignedSegments(
  ways: Array<{ id: number; name?: string; coordinates: Coordinate[] }>,
  sunsetAzimuth: number,
): StreetSegment[] {
  const segments: StreetSegment[] = []

  for (const way of ways) {
    let run: SegmentRun | null = null

    for (let index = 0; index < way.coordinates.length - 1; index += 1) {
      const from = way.coordinates[index]
      const to = way.coordinates[index + 1]
      const lengthMeters = distanceMeters(from, to)

      const bearing = bearingDegrees(from, to)
      const oppositeBearing = normalizeDegrees(bearing + 180)
      const forwardDeviation = angularDeviation(bearing, sunsetAzimuth)
      const oppositeDeviation = angularDeviation(oppositeBearing, sunsetAzimuth)
      const matchedBearing = forwardDeviation <= oppositeDeviation ? bearing : oppositeBearing
      const deviation = Math.min(forwardDeviation, oppositeDeviation)
      const alignmentClass = classifyDeviation(deviation)

      if (!alignmentClass) {
        flushRun(run, sunsetAzimuth, segments)
        run = null
        continue
      }

      if (run && angularDeviation(runBearing(run), matchedBearing) <= MAX_MERGE_BEARING_DEVIATION) {
        run.coordinates.push(to)
        run.bearingX += Math.cos(toRadians(bearing)) * lengthMeters
        run.bearingY += Math.sin(toRadians(bearing)) * lengthMeters
        run.matchedBearingX += Math.cos(toRadians(matchedBearing)) * lengthMeters
        run.matchedBearingY += Math.sin(toRadians(matchedBearing)) * lengthMeters
        run.lengthMeters += lengthMeters
      } else {
        flushRun(run, sunsetAzimuth, segments)
        run = {
          id: `${way.id}-${index}`,
          name: way.name ?? 'Unbenannte Strasse',
          coordinates: [from, to],
          bearingX: Math.cos(toRadians(bearing)) * lengthMeters,
          bearingY: Math.sin(toRadians(bearing)) * lengthMeters,
          matchedBearingX: Math.cos(toRadians(matchedBearing)) * lengthMeters,
          matchedBearingY: Math.sin(toRadians(matchedBearing)) * lengthMeters,
          lengthMeters,
        }
      }
    }

    flushRun(run, sunsetAzimuth, segments)
  }

  return mergeSegmentsAcrossWays(segments, sunsetAzimuth)
    .filter(isDisplayWorthySegment)
    .sort((a, b) => a.deviation - b.deviation || b.lengthMeters - a.lengthMeters)
}

function mergeSegmentsAcrossWays(segments: StreetSegment[], sunsetAzimuth: number): StreetSegment[] {
  const remaining = [...segments]
  let changed = true

  while (changed) {
    changed = false

    outer: for (let i = 0; i < remaining.length; i += 1) {
      for (let j = i + 1; j < remaining.length; j += 1) {
        const merged = tryMergeSegments(remaining[i], remaining[j], sunsetAzimuth)

        if (!merged) {
          continue
        }

        remaining.splice(j, 1)
        remaining[i] = merged
        changed = true
        break outer
      }
    }
  }

  return remaining
}

function tryMergeSegments(
  first: StreetSegment,
  second: StreetSegment,
  sunsetAzimuth: number,
): StreetSegment | null {
  if (!canMergeByName(first, second)) {
    return null
  }

  if (angularDeviation(first.matchedBearing, second.matchedBearing) > MAX_MERGE_BEARING_DEVIATION) {
    return null
  }

  const firstStart = first.coordinates[0]
  const firstEnd = first.coordinates[first.coordinates.length - 1]
  const secondStart = second.coordinates[0]
  const secondEnd = second.coordinates[second.coordinates.length - 1]
  const candidates = [
    {
      gap: distanceMeters(firstEnd, secondStart),
      coordinates: [...first.coordinates, ...second.coordinates.slice(1)],
    },
    {
      gap: distanceMeters(secondEnd, firstStart),
      coordinates: [...second.coordinates, ...first.coordinates.slice(1)],
    },
    {
      gap: distanceMeters(firstStart, secondStart),
      coordinates: [...first.coordinates.toReversed(), ...second.coordinates.slice(1)],
    },
    {
      gap: distanceMeters(firstEnd, secondEnd),
      coordinates: [...first.coordinates, ...second.coordinates.toReversed().slice(1)],
    },
  ].sort((a, b) => a.gap - b.gap)
  const best = candidates[0]

  if (best.gap > MAX_CROSS_WAY_GAP_METERS) {
    return null
  }

  return buildMergedSegment(first, second, best.coordinates, sunsetAzimuth)
}

function canMergeByName(first: StreetSegment, second: StreetSegment): boolean {
  const firstName = normalizeStreetName(first.name)
  const secondName = normalizeStreetName(second.name)

  return firstName !== '' && firstName === secondName
}

function normalizeStreetName(name: string): string {
  return name === 'Unbenannte Strasse' ? '' : name.trim().toLowerCase()
}

function buildMergedSegment(
  first: StreetSegment,
  second: StreetSegment,
  coordinates: Coordinate[],
  sunsetAzimuth: number,
): StreetSegment | null {
  const lengthMeters = lineLengthMeters(coordinates)
  const matchedBearing = weightedBearing([
    [first.matchedBearing, first.lengthMeters],
    [second.matchedBearing, second.lengthMeters],
  ])
  const bearing = weightedBearing([
    [first.bearing, first.lengthMeters],
    [second.bearing, second.lengthMeters],
  ])
  const deviation = angularDeviation(matchedBearing, sunsetAzimuth)
  const alignmentClass = classifyDeviation(deviation)

  if (!alignmentClass) {
    return null
  }

  return {
    id: `${first.id}+${second.id}`,
    name: first.name,
    coordinates,
    bearing,
    matchedBearing,
    deviation,
    lengthMeters,
    alignmentClass,
  }
}

function weightedBearing(values: Array<[number, number]>): number {
  const vector = values.reduce(
    (sum, [bearing, weight]) => ({
      x: sum.x + Math.cos(toRadians(bearing)) * weight,
      y: sum.y + Math.sin(toRadians(bearing)) * weight,
    }),
    { x: 0, y: 0 },
  )

  return vectorBearing(vector.x, vector.y)
}

function lineLengthMeters(coordinates: Coordinate[]): number {
  return coordinates.reduce((sum, coordinate, index) => {
    if (index === 0) {
      return sum
    }

    return sum + distanceMeters(coordinates[index - 1], coordinate)
  }, 0)
}

function flushRun(run: SegmentRun | null, sunsetAzimuth: number, segments: StreetSegment[]) {
  if (!run || run.lengthMeters < MIN_SEGMENT_LENGTH_METERS) {
    return
  }

  const bearing = vectorBearing(run.bearingX, run.bearingY)
  const matchedBearing = runBearing(run)
  const deviation = angularDeviation(matchedBearing, sunsetAzimuth)
  const alignmentClass = classifyDeviation(deviation)

  if (!alignmentClass) {
    return
  }

  segments.push({
    id: run.id,
    name: run.name,
    coordinates: run.coordinates,
    bearing,
    matchedBearing,
    deviation,
    lengthMeters: run.lengthMeters,
    alignmentClass,
  })
}

function isDisplayWorthySegment(segment: StreetSegment): boolean {
  if (segment.alignmentClass === 'excellent') {
    return segment.lengthMeters >= MIN_EXCELLENT_LENGTH_METERS
  }

  if (segment.alignmentClass === 'good') {
    return segment.lengthMeters >= MIN_GOOD_LENGTH_METERS
  }

  return segment.lengthMeters >= MIN_FAIR_LENGTH_METERS
}

function runBearing(run: SegmentRun): number {
  return vectorBearing(run.matchedBearingX, run.matchedBearingY)
}

function vectorBearing(x: number, y: number): number {
  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI)
}

export function toSegmentFeatureCollection(segments: StreetSegment[]) {
  return {
    type: 'FeatureCollection' as const,
    features: segments.map((segment) => ({
      type: 'Feature' as const,
      id: segment.id,
      properties: {
        id: segment.id,
        name: segment.name,
        deviation: segment.deviation,
        matchedBearing: segment.matchedBearing,
        lengthMeters: segment.lengthMeters,
        alignmentClass: segment.alignmentClass,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: segment.coordinates,
      },
    })),
  }
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}
