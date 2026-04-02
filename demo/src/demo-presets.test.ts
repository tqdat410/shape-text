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
    const preset = fillTextPresets.find(candidate => candidate.id === 'hex')
    if (preset?.id !== 'hex') {
      throw new Error('Expected hex preset')
    }

    let callCount = 0
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(values => {
      const uint32Values = values as Uint32Array
      const batch = Math.floor(callCount / preset.defaultLength)
      uint32Values[0] = callCount + batch
      callCount += 1
      return values
    })

    const firstText = createFillTextPresetText('hex')
    const secondText = createFillTextPresetText('hex')

    expect(firstText).not.toBeNull()
    expect(secondText).not.toBeNull()
    expect(firstText).toHaveLength(preset.defaultLength)
    expect(secondText).toHaveLength(preset.defaultLength)
    expect(firstText).not.toBe(secondText)
    expect([...firstText!].every(character => preset.alphabet.includes(character))).toBe(true)
    expect([...secondText!].every(character => preset.alphabet.includes(character))).toBe(true)
  })
})
