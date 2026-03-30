import type { LayoutCursor, LayoutLineRange, PreparedLayoutText, PreparedLayoutToken } from '../types.js'

function getWordSliceWidth(token: PreparedLayoutToken, start: number, end: number): number {
  return token.graphemePrefixWidths[end]! - token.graphemePrefixWidths[start]!
}

function getWordSliceText(token: PreparedLayoutToken, start: number, end: number): string {
  return token.graphemes.slice(start, end).join('')
}

function fitWordFragment(token: PreparedLayoutToken, start: number, maxWidth: number): number {
  const availableWidth = Math.max(0, maxWidth)

  for (let end = start + 1; end <= token.graphemes.length; end++) {
    const width = getWordSliceWidth(token, start, end)
    if (width > availableWidth) {
      return end === start + 1 ? end : end - 1
    }
  }

  return token.graphemes.length
}

export function layoutNextLineFromPreparedText(
  prepared: PreparedLayoutText,
  start: LayoutCursor,
  maxWidth: number,
): LayoutLineRange | null {
  if (start.tokenIndex >= prepared.tokens.length) return null

  const lineWords: string[] = []
  let width = 0
  let tokenIndex = start.tokenIndex
  let graphemeIndex = start.graphemeIndex

  while (tokenIndex < prepared.tokens.length) {
    const token = prepared.tokens[tokenIndex]!

    if (token.kind === 'newline') {
      return {
        text: lineWords.join(' '),
        width,
        start,
        end: { tokenIndex: tokenIndex + 1, graphemeIndex: 0 },
      }
    }

    const sliceStart = tokenIndex === start.tokenIndex ? graphemeIndex : 0
    const spacing = lineWords.length === 0 ? 0 : prepared.spaceWidth
    const remainingWidth = getWordSliceWidth(token, sliceStart, token.graphemes.length)

    if (width + spacing + remainingWidth <= maxWidth) {
      lineWords.push(getWordSliceText(token, sliceStart, token.graphemes.length))
      width += spacing + remainingWidth
      tokenIndex += 1
      graphemeIndex = 0
      continue
    }

    if (lineWords.length > 0) {
      return {
        text: lineWords.join(' '),
        width,
        start,
        end: { tokenIndex, graphemeIndex: sliceStart },
      }
    }

    const fittedEnd = fitWordFragment(token, sliceStart, maxWidth)
    const fragmentText = getWordSliceText(token, sliceStart, fittedEnd)
    const fragmentWidth = getWordSliceWidth(token, sliceStart, fittedEnd)
    const nextCursor =
      fittedEnd >= token.graphemes.length
        ? { tokenIndex: tokenIndex + 1, graphemeIndex: 0 }
        : { tokenIndex, graphemeIndex: fittedEnd }

    return {
      text: fragmentText,
      width: fragmentWidth,
      start,
      end: nextCursor,
    }
  }

  return {
    text: lineWords.join(' '),
    width,
    start,
    end: { tokenIndex, graphemeIndex: 0 },
  }
}

