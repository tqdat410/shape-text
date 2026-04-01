import type { PreparedLayoutToken, TextMeasurer } from '../types.js'
import { createMeasuredWordToken } from './segment-text-for-layout.js'

function normalizeRepeatStreamText(text: string): string {
  return text.replace(/\r\n?/gu, '\n').replace(/[\n\t\f\v]+/gu, ' ')
}

export function prepareStreamRepeatFillPattern(
  text: string,
  font: string,
  measurer: TextMeasurer,
): PreparedLayoutToken {
  const normalized = normalizeRepeatStreamText(text)

  if (normalized.length === 0) {
    throw new Error('stream autoFill requires at least one grapheme')
  }

  const pattern = createMeasuredWordToken(normalized, value => measurer.measureText(value, font))
  if (pattern.width <= 0) {
    throw new Error('stream autoFill requires measurable graphemes')
  }

  return pattern
}
