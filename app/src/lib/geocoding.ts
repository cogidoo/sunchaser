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

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
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
  const timeout = window.setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
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
    window.clearTimeout(timeout)
  }
}
