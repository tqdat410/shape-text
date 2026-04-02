import type { CompiledShapeBand, Interval } from '../types.js'

export type TextMaskAlphaBandsOptions = {
  width: number
  height: number
  maskScale: number
  alphaThreshold: number
}

function intersectIntervalSets(leftSet: Interval[], rightSet: Interval[]): Interval[] {
  const intersections: Interval[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < leftSet.length && rightIndex < rightSet.length) {
    const left = leftSet[leftIndex]!
    const right = rightSet[rightIndex]!
    const overlapLeft = Math.max(left.left, right.left)
    const overlapRight = Math.min(left.right, right.right)

    if (overlapRight > overlapLeft) {
      intersections.push({ left: overlapLeft, right: overlapRight })
    }

    if (left.right < right.right) {
      leftIndex += 1
    } else {
      rightIndex += 1
    }
  }

  return intersections
}

function getRowIntervals(
  alpha: Uint8ClampedArray,
  row: number,
  width: number,
  alphaThreshold: number,
): Interval[] {
  const intervals: Interval[] = []
  let start = -1
  const rowOffset = row * width * 4

  for (let x = 0; x < width; x++) {
    const isSolid = alpha[rowOffset + x * 4 + 3] >= alphaThreshold

    if (isSolid && start < 0) {
      start = x
      continue
    }

    if (!isSolid && start >= 0) {
      intervals.push({ left: start, right: x })
      start = -1
    }
  }

  if (start >= 0) {
    intervals.push({ left: start, right: width })
  }

  return intervals
}

export function buildTextMaskBandsFromAlpha(
  options: TextMaskAlphaBandsOptions,
  alpha: Uint8ClampedArray,
  lineHeight: number,
  minSlotWidth: number,
): CompiledShapeBand[] {
  const pixelWidth = Math.max(1, Math.ceil(options.width * options.maskScale))
  const bands: CompiledShapeBand[] = []

  for (let bandTop = 0; bandTop + lineHeight <= options.height; bandTop += lineHeight) {
    const startRow = Math.floor(bandTop * options.maskScale)
    const endRow = Math.max(startRow, Math.ceil((bandTop + lineHeight) * options.maskScale) - 1)
    let intervals: Interval[] | null = null

    for (let row = startRow; row <= endRow; row++) {
      const rowIntervals = getRowIntervals(alpha, row, pixelWidth, options.alphaThreshold)
      if (rowIntervals.length === 0) {
        intervals = []
        break
      }

      intervals = intervals === null ? rowIntervals : intersectIntervalSets(intervals, rowIntervals)
      if (intervals.length === 0) {
        break
      }
    }

    bands.push({
      top: bandTop,
      bottom: bandTop + lineHeight,
      intervals: (intervals ?? [])
        .map(interval => ({
          left: interval.left / options.maskScale,
          right: interval.right / options.maskScale,
        }))
        .filter(interval => interval.right - interval.left >= minSlotWidth),
    })
  }

  return bands
}
