import { describe, expect, it } from 'vitest'
import { getSunsetInfo, normalizeDegrees, toCardinal } from './sun'

describe('sun utilities', () => {
  it('normalizes degrees', () => {
    expect(normalizeDegrees(-1)).toBe(359)
    expect(normalizeDegrees(361)).toBe(1)
  })

  it('formats cardinal directions', () => {
    expect(toCardinal(0)).toBe('N')
    expect(toCardinal(91)).toBe('E')
    expect(toCardinal(224)).toBe('SW')
  })

  it('calculates a plausible Berlin sunset azimuth in late April', () => {
    const info = getSunsetInfo('2026-04-26', 52.52, 13.405)

    expect(info.azimuth).toBeGreaterThan(290)
    expect(info.azimuth).toBeLessThan(310)
    expect(info.cardinal).toBe('NW')
    expect(Number.isNaN(info.sunset.getTime())).toBe(false)
  })
})
