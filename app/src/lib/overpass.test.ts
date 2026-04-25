import { describe, expect, it } from 'vitest'
import { boundsDiagonalKilometers, boundsKey, parseOverpassWays, type OverpassResponse } from './overpass'

describe('overpass utilities', () => {
  it('creates stable rounded bounds cache keys', () => {
    expect(
      boundsKey({
        south: 52.50049,
        west: 13.40049,
        north: 52.51049,
        east: 13.41049,
      }),
    ).toBe('52.500,13.400,52.510,13.410')
  })

  it('calculates map bounds diagonal', () => {
    const diagonal = boundsDiagonalKilometers({ south: 52.5, west: 13.4, north: 52.51, east: 13.41 })

    expect(diagonal).toBeGreaterThan(1)
    expect(diagonal).toBeLessThan(2)
  })

  it('parses Overpass ways into named coordinate lists', () => {
    const fixture: OverpassResponse = {
      elements: [
        { type: 'way', id: 100, nodes: [1, 2, 3], tags: { highway: 'residential', name: 'Fixture Street' } },
        { type: 'way', id: 101, nodes: [4], tags: { highway: 'residential' } },
        { type: 'way', id: 102, nodes: [1, 2], tags: { highway: 'footway', footway: 'sidewalk' } },
        { type: 'way', id: 103, nodes: [2, 3], tags: { highway: 'service', service: 'driveway' } },
        { type: 'node', id: 1, lat: 52.5, lon: 13.4 },
        { type: 'node', id: 2, lat: 52.5, lon: 13.401 },
        { type: 'node', id: 3, lat: 52.5, lon: 13.402 },
        { type: 'node', id: 4, lat: 52.5, lon: 13.403 },
      ],
    }

    expect(parseOverpassWays(fixture)).toEqual([
      {
        id: 100,
        name: 'Fixture Street',
        highway: 'residential',
        coordinates: [
          [13.4, 52.5],
          [13.401, 52.5],
          [13.402, 52.5],
        ],
      },
    ])
  })
})
