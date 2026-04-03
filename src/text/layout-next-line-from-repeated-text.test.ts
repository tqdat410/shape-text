import { describe, expect, it } from 'vitest'

import type { PreparedLayoutToken, PreparedLayoutText } from '../types.js'
import { layoutNextLineFromRepeatedText } from './layout-next-line-from-repeated-text.js'

function createWordToken(text: string, width = text.length * 10): PreparedLayoutToken {
  const graphemes = Array.from(text)
  const graphemeWidth = graphemes.length === 0 ? 0 : width / graphemes.length
  return {
    kind: 'word',
    text,
    width,
    graphemes,
    graphemePrefixWidths: [0, ...graphemes.map((_, index) => (index + 1) * graphemeWidth)],
  }
}

describe('layoutNextLineFromRepeatedText', () => {
  it('returns null when repeated text contains only zero-grapheme word tokens', () => {
    const prepared: PreparedLayoutText = {
      font: '16px Test Sans',
      spaceWidth: 4,
      tokens: [
        {
          kind: 'word',
          text: '',
          width: 0,
          graphemes: [],
          graphemePrefixWidths: [],
        },
      ],
    }

    expect(layoutNextLineFromRepeatedText(prepared, { tokenIndex: 0, graphemeIndex: 0 }, 100)).toBeNull()
  })

  it('skips zero-grapheme word tokens before laying out repeated content', () => {
    const prepared: PreparedLayoutText = {
      font: '16px Test Sans',
      spaceWidth: 4,
      tokens: [
        {
          kind: 'word',
          text: '',
          width: 0,
          graphemes: [],
          graphemePrefixWidths: [],
        },
        createWordToken('AB', 20),
      ],
    }

    expect(layoutNextLineFromRepeatedText(prepared, { tokenIndex: 0, graphemeIndex: 0 }, 20)).toEqual({
      text: 'AB',
      width: 20,
      start: { tokenIndex: 0, graphemeIndex: 0 },
      end: { tokenIndex: 3, graphemeIndex: 0 },
    })
  })
})
