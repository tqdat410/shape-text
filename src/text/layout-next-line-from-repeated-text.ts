import type { LayoutCursor, LayoutLineRange, PreparedLayoutText } from '../types.js'
import { fitWordFragment, getWordSliceText, getWordSliceWidth } from './layout-text-line-helpers.js'

export function layoutNextLineFromRepeatedText(
  prepared: PreparedLayoutText,
  start: LayoutCursor,
  maxWidth: number,
): LayoutLineRange | null {
  if (prepared.tokens.length === 0) return null

  const lineWords: string[] = []
  let width = 0
  let tokenIndex = start.tokenIndex
  let graphemeIndex = start.graphemeIndex

  while (true) {
    const token = prepared.tokens[tokenIndex % prepared.tokens.length]!

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
}
