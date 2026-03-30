import type { PreparedLayoutToken } from '../types.js'

export function getWordSliceWidth(
  token: PreparedLayoutToken,
  start: number,
  end: number,
): number {
  return token.graphemePrefixWidths[end]! - token.graphemePrefixWidths[start]!
}

export function getWordSliceText(
  token: PreparedLayoutToken,
  start: number,
  end: number,
): string {
  return token.graphemes.slice(start, end).join('')
}

export function fitWordFragment(
  token: PreparedLayoutToken,
  start: number,
  maxWidth: number,
): number {
  const availableWidth = Math.max(0, maxWidth)

  for (let end = start + 1; end <= token.graphemes.length; end++) {
    const width = getWordSliceWidth(token, start, end)
    if (width > availableWidth) {
      return end === start + 1 ? end : end - 1
    }
  }

  return token.graphemes.length
}
