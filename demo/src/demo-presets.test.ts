import { afterEach, describe, expect, it, vi } from 'vitest'

import { createFillTextPresetText, fillTextPresets } from './demo-presets'

describe('createFillTextPresetText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null for the custom preset', () => {
    expect(createFillTextPresetText('custom')).toBeNull()
  })

  it('creates fresh random text from the preset alphabet', () => {
    let callCount = 0
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(values => {
      const uint32Values = values as Uint32Array

      for (let index = 0; index < uint32Values.length; index++) {
        uint32Values[index] = callCount + index
      }

      callCount += 1
      return values
    })

    const preset = fillTextPresets.find(candidate => candidate.id === 'hex-random')
    if (preset?.id !== 'hex-random') {
      throw new Error('Expected hex-random preset')
    }

    const firstText = createFillTextPresetText('hex-random')
    const secondText = createFillTextPresetText('hex-random')

    expect(firstText).not.toBeNull()
    expect(secondText).not.toBeNull()
    expect(firstText).toHaveLength(preset.length)
    expect(secondText).toHaveLength(preset.length)
    expect(firstText).not.toBe(secondText)
    expect([...firstText!].every(character => preset.alphabet.includes(character))).toBe(true)
    expect([...secondText!].every(character => preset.alphabet.includes(character))).toBe(true)
  })
})
