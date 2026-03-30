import type { PreparedLayoutText, TextMeasurer } from '../types.js'
import { createMeasuredWordToken, segmentTextForLayout } from './segment-text-for-layout.js'

export function prepareTextForLayout(
  text: string,
  font: string,
  measurer: TextMeasurer,
): PreparedLayoutText {
  const segmented = segmentTextForLayout(text)
  const tokens = segmented.map(token => {
    if (token.kind === 'newline') {
      return {
        kind: 'newline' as const,
        text: token.text,
        width: 0,
        graphemes: [],
        graphemePrefixWidths: [0],
      }
    }

    return createMeasuredWordToken(token.text, value => measurer.measureText(value, font))
  })

  return {
    font,
    spaceWidth: measurer.measureText(' ', font),
    tokens,
  }
}

