import { describe, expect, it } from 'vitest'
import { formatTimeZoneLabel, resolveLocationTimeZone } from './timezone'

describe('timezone utilities', () => {
  it('resolves an IANA timezone for a location', () => {
    expect(resolveLocationTimeZone(52.52, 13.405)).toEqual({ timeZone: 'Europe/Berlin', isFallback: false })
  })

  it('falls back visibly when timezone lookup fails', () => {
    const fallback = resolveLocationTimeZone(91, 181, () => {
      throw new Error('outside lookup bounds')
    })

    expect(fallback.timeZone).toBeTruthy()
    expect(fallback.isFallback).toBe(true)
    expect(formatTimeZoneLabel(fallback)).toContain('Browser-Fallback')
  })
})
