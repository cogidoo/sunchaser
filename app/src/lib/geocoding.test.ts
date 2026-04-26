import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchAddress } from './geocoding'

describe('geocoding provider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects failed provider responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('rate limited', { status: 429 })))

    await expect(searchAddress('provider failure fixture')).rejects.toThrow('Address search failed with status 429')
  })

  it('reuses cached results before calling the provider again', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json([
        {
          place_id: 1,
          display_name: 'Cached Place',
          lat: '52.5',
          lon: '13.4',
        },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchAddress('cached geocoding fixture')).resolves.toEqual([
      { id: '1', label: 'Cached Place', lat: 52.5, lon: 13.4 },
    ])
    await expect(searchAddress('cached geocoding fixture')).resolves.toEqual([
      { id: '1', label: 'Cached Place', lat: 52.5, lon: 13.4 },
    ])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
