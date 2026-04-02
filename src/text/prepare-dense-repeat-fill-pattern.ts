import type { PreparedLayoutToken, TextMeasurer } from '../types.js'
import { createMeasuredWordToken } from './segment-text-for-layout.js'

export function prepareDenseRepeatFillPattern(
  text: string,
  font: string,
  measurer: TextMeasurer,
): PreparedLayoutToken {
  const normalized = text.replace(/\s+/gu, '')

  if (normalized.length === 0) {
    throw new Error('dense autoFill requires at least one non-whitespace grapheme')
  }

  const pattern = createMeasuredWordToken(normalized, value => measurer.measureText(value, font))
  if (pattern.width <= 0) {
    throw new Error('dense autoFill requires measurable graphemes')
  }

  return pattern
}
