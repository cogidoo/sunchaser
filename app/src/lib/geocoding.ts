import { appConfig } from '../config'

export type GeocodeResult = {
  id: string
  label: string
  lat: number
  lon: number
}

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const cache = new Map<string, GeocodeResult[]>()

export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const normalized = query.trim().toLowerCase()

  if (normalized.length < 3) {
    return []
  }

  const cached = cache.get(normalized)

  if (cached) {
    return cached
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'jsonv2',
    limit: '5',
  })
  const controller = new AbortController()
  const abort = () => controller.abort()
  const timeout = globalThis.setTimeout(() => controller.abort(), appConfig.geocodingTimeoutMs)

  signal?.addEventListener('abort', abort, { once: true })

  try {
    const response = await fetch(`${appConfig.nominatimSearchUrl}?${params}`, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Address search failed with status ${response.status}.`)
    }

    const data = (await response.json()) as NominatimResult[]
    const results = data.map((result) => ({
      id: String(result.place_id),
      label: result.display_name,
      lat: Number.parseFloat(result.lat),
      lon: Number.parseFloat(result.lon),
    }))

    cache.set(normalized, results)
    return results
  } finally {
    globalThis.clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
