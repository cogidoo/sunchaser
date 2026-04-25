import { describe, expect, it } from 'vitest'
import {
  angularDeviation,
  bearingDegrees,
  buildAlignedSegments,
  classifyDeviation,
  distanceMeters,
  toSegmentFeatureCollection,
} from './geometry'

describe('geometry utilities', () => {
  it('calculates cardinal bearings', () => {
    expect(bearingDegrees([13.4, 52.5], [13.4, 52.51])).toBeCloseTo(0, 0)
    expect(bearingDegrees([13.4, 52.5], [13.41, 52.5])).toBeCloseTo(90, 0)
    expect(bearingDegrees([13.4, 52.5], [13.4, 52.49])).toBeCloseTo(180, 0)
    expect(bearingDegrees([13.4, 52.5], [13.39, 52.5])).toBeCloseTo(270, 0)
  })

  it('calculates distance in meters', () => {
    expect(distanceMeters([13.4, 52.5], [13.4, 52.501])).toBeGreaterThan(100)
    expect(distanceMeters([13.4, 52.5], [13.4, 52.501])).toBeLessThan(120)
  })

  it('handles angular wraparound', () => {
    expect(angularDeviation(359, 1)).toBe(2)
    expect(angularDeviation(10, 350)).toBe(20)
  })

  it('classifies deviation thresholds', () => {
    expect(classifyDeviation(2)).toBe('excellent')
    expect(classifyDeviation(5)).toBe('good')
    expect(classifyDeviation(10)).toBe('fair')
    expect(classifyDeviation(10.1)).toBeNull()
  })

  it('scores both travel directions and filters short noisy segments', () => {
    const segments = buildAlignedSegments(
      [
        {
          id: 1,
          name: 'Sunset Avenue',
          coordinates: [
            [13.4, 52.5],
            [13.4013, 52.5],
          ],
        },
        {
          id: 2,
          name: 'Tiny Street',
          coordinates: [
            [13.4, 52.5],
            [13.40001, 52.5],
          ],
        },
      ],
      270,
    )

    expect(segments).toHaveLength(1)
    expect(segments[0].name).toBe('Sunset Avenue')
    expect(segments[0].matchedBearing).toBeCloseTo(270, 0)
    expect(segments[0].alignmentClass).toBe('excellent')
  })

  it('applies length-aware display thresholds by alignment quality', () => {
    expect(
      buildAlignedSegments(
        [
          {
            id: 1,
            name: 'Short Perfect Street',
            coordinates: [
              [13.4, 52.5],
              [13.4008, 52.5],
            ],
          },
        ],
        90,
      ),
    ).toHaveLength(0)

    expect(
      buildAlignedSegments(
        [
          {
            id: 2,
            name: 'Perfect Street',
            coordinates: [
              [13.4, 52.5],
              [13.4012, 52.5],
            ],
          },
        ],
        90,
      ),
    ).toHaveLength(1)

    expect(
      buildAlignedSegments(
        [
          {
            id: 3,
            name: 'Short Fair Street',
            coordinates: [
              [13.4, 52.5],
              [13.402, 52.50018],
            ],
          },
        ],
        90,
      ),
    ).toHaveLength(0)

    expect(
      buildAlignedSegments(
        [
          {
            id: 4,
            name: 'Fair Street',
            coordinates: [
              [13.4, 52.5],
              [13.403, 52.50027],
            ],
          },
        ],
        90,
      ),
    ).toHaveLength(1)
  })

  it('merges adjacent aligned pieces of the same street into one continuous run', () => {
    const segments = buildAlignedSegments(
      [
        {
          id: 1,
          name: 'Long Straight Street',
          coordinates: [
            [13.4, 52.5],
            [13.401, 52.5],
            [13.402, 52.50002],
            [13.403, 52.50003],
          ],
        },
      ],
      90,
    )

    expect(segments).toHaveLength(1)
    expect(segments[0].coordinates).toHaveLength(4)
    expect(segments[0].lengthMeters).toBeGreaterThan(190)
    expect(segments[0].alignmentClass).toBe('excellent')
  })

  it('merges aligned pieces of the same named street across OSM way boundaries', () => {
    const segments = buildAlignedSegments(
      [
        {
          id: 1,
          name: 'Louisenstrasse',
          coordinates: [
            [13.4, 52.5],
            [13.401, 52.5],
          ],
        },
        {
          id: 2,
          name: 'Louisenstrasse',
          coordinates: [
            [13.401, 52.5],
            [13.402, 52.5],
          ],
        },
        {
          id: 3,
          name: 'Other Street',
          coordinates: [
            [13.402, 52.5],
            [13.403, 52.5],
          ],
        },
      ],
      90,
    )

    const louisenstrasse = segments.find((segment) => segment.name === 'Louisenstrasse')

    expect(louisenstrasse?.coordinates).toHaveLength(3)
    expect(louisenstrasse?.lengthMeters).toBeGreaterThan(130)
  })

  it('does not draw artificial connectors between nearby parallel ways with the same name', () => {
    const segments = buildAlignedSegments(
      [
        {
          id: 1,
          name: 'Koepckestrasse',
          coordinates: [
            [13.4, 52.5],
            [13.402, 52.5],
          ],
        },
        {
          id: 2,
          name: 'Koepckestrasse',
          coordinates: [
            [13.402, 52.5001],
            [13.404, 52.5001],
          ],
        },
      ],
      90,
    )

    expect(segments).toHaveLength(2)
    expect(segments.every((segment) => segment.coordinates.length === 2)).toBe(true)
  })

  it('splits a way when the street bends away from the sunset axis', () => {
    const segments = buildAlignedSegments(
      [
        {
          id: 1,
          name: 'Bent Street',
          coordinates: [
            [13.4, 52.5],
            [13.402, 52.5],
            [13.402, 52.502],
            [13.404, 52.502],
          ],
        },
      ],
      90,
    )

    expect(segments).toHaveLength(2)
    expect(segments.every((segment) => segment.coordinates.length === 2)).toBe(true)
  })

  it('serializes segments as a GeoJSON feature collection', () => {
    const segments = buildAlignedSegments(
      [
        {
          id: 1,
          coordinates: [
            [13.4, 52.5],
            [13.4013, 52.5],
          ],
        },
      ],
      90,
    )
    const collection = toSegmentFeatureCollection(segments)

    expect(collection.type).toBe('FeatureCollection')
    expect(collection.features[0].geometry.type).toBe('LineString')
    expect(collection.features[0].geometry.coordinates).toHaveLength(2)
    expect(collection.features[0].properties.name).toBe('Unbenannte Strasse')
  })
})
