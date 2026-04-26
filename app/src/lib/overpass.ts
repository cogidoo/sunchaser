import type { Coordinate } from './geometry'
import { appConfig } from '../config'

export type Bounds = {
  south: number
  west: number
  north: number
  east: number
}

export type OsmWay = {
  id: number
  name?: string
  highway: string
  coordinates: Coordinate[]
}

export type OverpassElement =
  | { type: 'node'; id: number; lat: number; lon: number }
  | { type: 'way'; id: number; nodes: number[]; tags?: Record<string, string> }

export type OverpassResponse = {
  elements: OverpassElement[]
}

const cache = new Map<string, OsmWay[]>()
const STREET_CENTERLINE_HIGHWAYS = new Set([
  'primary',
  'primary_link',
  'secondary',
  'secondary_link',
  'tertiary',
  'tertiary_link',
  'unclassified',
  'residential',
  'living_street',
  'pedestrian',
])

export function boundsKey(bounds: Bounds): string {
  return [bounds.south, bounds.west, bounds.north, bounds.east].map((value) => value.toFixed(5)).join(',')
}

export function boundsDiagonalKilometers(bounds: Bounds): number {
  return haversineKilometers(bounds.south, bounds.west, bounds.north, bounds.east)
}

export async function fetchStreetWays(bounds: Bounds, signal?: AbortSignal): Promise<OsmWay[]> {
  const key = boundsKey(bounds)
  const cached = cache.get(key)

  if (cached) {
    return cached
  }

  const query = buildQuery(bounds)
  const controller = new AbortController()
  const abort = () => controller.abort()
  const timeout = globalThis.setTimeout(() => controller.abort(), appConfig.overpassTimeoutMs)

  signal?.addEventListener('abort', abort, { once: true })

  try {
    const response = await fetch(appConfig.overpassUrl, {
      method: 'POST',
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Overpass request failed with status ${response.status}.`)
    }

    const data = (await response.json()) as OverpassResponse
    const ways = parseOverpassWays(data)
    cache.set(key, ways)
    return ways
  } finally {
    globalThis.clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

function buildQuery(bounds: Bounds): string {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`

  return `
    [out:json][timeout:12];
    (
      way["highway"~"^(primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street|pedestrian)$"]
        (${bbox});
    );
    out body;
    >;
    out skel qt;
  `
}

export function parseOverpassWays(data: OverpassResponse): OsmWay[] {
  const nodes = new Map<number, Coordinate>()
  const ways: OsmWay[] = []

  for (const element of data.elements) {
    if (element.type === 'node') {
      nodes.set(element.id, [element.lon, element.lat])
    }
  }

  for (const element of data.elements) {
    if (element.type !== 'way') {
      continue
    }

    const highway = element.tags?.highway

    if (!highway || !STREET_CENTERLINE_HIGHWAYS.has(highway)) {
      continue
    }

    const coordinates = element.nodes.flatMap((nodeId) => {
      const coordinate = nodes.get(nodeId)
      return coordinate ? [coordinate] : []
    })

    if (coordinates.length < 2) {
      continue
    }

    ways.push({
      id: element.id,
      name: element.tags?.name,
      highway,
      coordinates,
    })
  }

  return ways
}

function haversineKilometers(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radius = 6371
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) ** 2

  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}
