import type { LayoutLineRange, PreparedLayoutToken } from '../types.js'
import { getWordSliceText, getWordSliceWidth } from './layout-text-line-helpers.js'

function findMaxSliceEnd(
  pattern: PreparedLayoutToken,
  start: number,
  maxWidth: number,
): number {
  let low = start
  let high = pattern.graphemes.length

  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    const width = getWordSliceWidth(pattern, start, mid)

    if (width <= maxWidth) {
      low = mid
      continue
    }

    high = mid - 1
  }

  return low
}

export function layoutNextLineFromDenseRepeatedText(
  pattern: PreparedLayoutToken,
  startOffset: number,
  maxWidth: number,
): LayoutLineRange | null {
  if (pattern.graphemes.length === 0) {
    return null
  }

  const availableWidth = Math.max(0, maxWidth)
  const start = { tokenIndex: startOffset, graphemeIndex: 0 }
  const textParts: string[] = []
  let width = 0
  let consumed = 0

  const appendSlice = (sliceStart: number, sliceEnd: number) => {
    if (sliceEnd <= sliceStart) {
      return
    }

    textParts.push(getWordSliceText(pattern, sliceStart, sliceEnd))
    width += getWordSliceWidth(pattern, sliceStart, sliceEnd)
    consumed += sliceEnd - sliceStart
  }

  const tailEnd = findMaxSliceEnd(pattern, startOffset, availableWidth)
  appendSlice(startOffset, tailEnd)

  if (tailEnd === pattern.graphemes.length) {
    const remainingAfterTail = availableWidth - width
    if (remainingAfterTail >= pattern.width) {
      const fullCycles = Math.floor(remainingAfterTail / pattern.width)
      if (fullCycles > 0) {
        textParts.push(pattern.text.repeat(fullCycles))
        width += pattern.width * fullCycles
        consumed += pattern.graphemes.length * fullCycles
      }
    }

    const remainingAfterCycles = availableWidth - width
    const prefixEnd = findMaxSliceEnd(pattern, 0, remainingAfterCycles)
    appendSlice(0, prefixEnd)
  }

  if (consumed === 0) {
    const forcedEnd = Math.min(startOffset + 1, pattern.graphemes.length)
    appendSlice(startOffset, forcedEnd)
  }

  return {
    text: textParts.join(''),
    width,
    start,
    end: {
      tokenIndex: (startOffset + consumed) % pattern.graphemes.length,
      graphemeIndex: 0,
    },
  }
}
