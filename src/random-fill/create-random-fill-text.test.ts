import { describe, expect, it } from 'vitest'

import { createRandomFillText } from './create-random-fill-text.js'
import { getRandomFillPreset, randomFillPresets } from './random-fill-presets.js'

describe('createRandomFillText', () => {
  it('creates deterministic preset text when a custom random selector is injected', () => {
    const preset = getRandomFillPreset('hex')
    if (!preset) {
      throw new Error('Expected hex preset')
    }

    let callCount = 0
    const text = createRandomFillText({
      preset: 'hex',
      randomInt(max) {
        const value = callCount % max
        callCount += 1
        return value
      },
    })

    expect(text).toHaveLength(preset.defaultLength)
    expect([...text].every(character => preset.alphabet.includes(character))).toBe(true)
  })

  it('supports custom alphabets and explicit lengths', () => {
    const text = createRandomFillText({
      alphabet: 'ABC',
      length: 5,
      randomInt(max) {
        return max - 1
      },
    })

    expect(text).toBe('CCCCC')
  })

  it('treats custom alphabets as grapheme choices instead of UTF-16 code units', () => {
    const text = createRandomFillText({
      alphabet: '😀😃',
      length: 4,
      randomInt() {
        return 1
      },
    })

    expect(text).toBe('😃😃😃😃')
  })

  it('throws on an empty alphabet', () => {
    expect(() => createRandomFillText({ alphabet: '', length: 5 })).toThrow(
      'Random fill alphabet must not be empty',
    )
  })

  it('throws on invalid lengths', () => {
    expect(() => createRandomFillText({ preset: 'ascii', length: 0 })).toThrow(
      'Random fill length must be a positive integer',
    )
  })

  it('throws when a custom random selector returns an invalid index', () => {
    expect(() =>
      createRandomFillText({
        preset: 'ascii',
        randomInt() {
          return -1
        },
      }),
    ).toThrow('Random fill selector must return an integer between 0 and max - 1')
  })

  it('throws on unknown preset ids at runtime', () => {
    expect(() =>
      createRandomFillText({
        preset: 'unknown' as never,
      }),
    ).toThrow('Unknown random fill preset: unknown')
  })
})

describe('randomFillPresets', () => {
  it('exposes stable preset metadata for consumers', () => {
    expect(randomFillPresets.map(preset => preset.id)).toEqual([
      'ascii',
      'binary',
      'hex',
      'octal',
      'symbol',
    ])
  })
})
