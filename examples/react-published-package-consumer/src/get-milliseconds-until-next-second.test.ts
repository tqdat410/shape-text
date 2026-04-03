import { describe, expect, it } from 'vitest'
import { getMillisecondsUntilNextSecond } from './get-milliseconds-until-next-second'

describe('getMillisecondsUntilNextSecond', () => {
  it('returns the remaining milliseconds inside the current second', () => {
    expect(getMillisecondsUntilNextSecond(new Date('2026-04-03T12:45:12.250+07:00'))).toBe(750)
  })

  it('returns a full second at an exact boundary', () => {
    expect(getMillisecondsUntilNextSecond(new Date('2026-04-03T12:45:12.000+07:00'))).toBe(1_000)
  })
})
