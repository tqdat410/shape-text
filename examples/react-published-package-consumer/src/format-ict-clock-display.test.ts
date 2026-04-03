import { describe, expect, it } from 'vitest'
import { formatIctClockDisplay } from './format-ict-clock-display'

describe('formatIctClockDisplay', () => {
  it('formats UTC input as ICT HH:mm:SS', () => {
    expect(formatIctClockDisplay(new Date('2026-04-03T05:45:09.000Z'))).toBe('12:45:09')
  })

  it('handles day rollover in Asia/Bangkok', () => {
    expect(formatIctClockDisplay(new Date('2026-04-03T18:05:07.000Z'))).toBe('01:05:07')
  })
})
