import { describe, expect, it } from 'vitest'

import { normalizeTextStyleToFont, resolveLayoutTextStyle } from './normalize-text-style-to-font.js'

describe('normalizeTextStyleToFont', () => {
  it('builds a canonical CSS font string from text style input', () => {
    expect(
      normalizeTextStyleToFont({
        family: '"Helvetica Neue", Arial, sans-serif',
        size: 18,
        weight: 700,
        style: 'italic',
        color: '#0f172a',
      }),
    ).toEqual({
      family: '"Helvetica Neue", Arial, sans-serif',
      size: 18,
      weight: 700,
      style: 'italic',
      color: '#0f172a',
      font: 'italic 700 18px "Helvetica Neue", Arial, sans-serif',
    })
  })

  it('uses the new textStyle API over the legacy font string', () => {
    const resolved = resolveLayoutTextStyle({
      font: '16px Old Font',
      textStyle: {
        family: 'Test Sans',
        size: 24,
        style: 'oblique',
      },
    })

    expect(resolved.font).toBe('oblique 400 24px Test Sans')
  })

  it('rejects missing font inputs', () => {
    expect(() => resolveLayoutTextStyle({})).toThrow('font or textStyle')
  })
})
