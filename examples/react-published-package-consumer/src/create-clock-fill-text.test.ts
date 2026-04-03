import { describe, expect, it } from 'vitest'
import { createClockFillText, resolveClockGlyphFills } from './create-clock-fill-text'

function createSequenceRandomInt(values: number[]) {
  let index = 0

  return (max: number) => {
    const value = values[index] ?? 0
    index += 1
    return value % max
  }
}

describe('createClockFillText', () => {
  it('picks a random preset family before generating fill content', () => {
    expect(createClockFillText({ randomInt: createSequenceRandomInt([0, ...Array(160).fill(0)]) })).toBe(
      '0'.repeat(160),
    )
    expect(createClockFillText({ randomInt: createSequenceRandomInt([2, ...Array(160).fill(0)]) })).toBe(
      '<'.repeat(160),
    )
    expect(createClockFillText({ randomInt: createSequenceRandomInt([4, ...Array(160).fill(0)]) })).toBe(
      'A'.repeat(160),
    )
  })

  it('reuses glyph fill content for unchanged positions only', () => {
    const fills = resolveClockGlyphFills('12:45:09', '12:45:10', [
      'a0',
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'a6',
      'a7',
    ])

    expect(fills[0]).toBe('a0')
    expect(fills[1]).toBe('a1')
    expect(fills[2]).toBe('a2')
    expect(fills[3]).toBe('a3')
    expect(fills[4]).toBe('a4')
    expect(fills[5]).toBe('a5')
    expect(fills[6]).not.toBe('a6')
    expect(fills[7]).not.toBe('a7')
  })
})
