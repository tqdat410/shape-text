import type { CompiledShapeBands, Interval, PreparedLayoutToken, ShapeTextLine } from '../types.js'
import { layoutNextLineFromDenseRepeatedText } from '../text/layout-next-line-from-dense-repeated-text.js'

export type DenseFillOccupiedRect = {
  left: number
  right: number
  top: number
  bottom: number
}

type LayoutDenseFillPassOptions = {
  compiledShape: CompiledShapeBands
  densePattern: PreparedLayoutToken
  startOffset: number
  align: 'left' | 'center'
  baselineRatio: number
  allSlots: boolean
  font?: string
  fillPass?: 1 | 2
}

function pickWidestInterval(intervals: Interval[]): Interval {
  let best = intervals[0]!

  for (let index = 1; index < intervals.length; index++) {
    const candidate = intervals[index]!
    if (candidate.right - candidate.left > best.right - best.left) {
      best = candidate
    }
  }

  return best
}

function getOrderedSlots(intervals: Interval[], allSlots: boolean): Interval[] {
  if (intervals.length === 0) {
    return []
  }

  if (!allSlots) {
    return [pickWidestInterval(intervals)]
  }

  return [...intervals].sort((left, right) => left.left - right.left)
}

export function layoutDenseFillPass(options: LayoutDenseFillPassOptions): {
  lines: ShapeTextLine[]
  endOffset: number
  occupiedRects: DenseFillOccupiedRect[]
} {
  const lines: ShapeTextLine[] = []
  const occupiedRects: DenseFillOccupiedRect[] = []
  let offset = options.startOffset

  for (let bandIndex = 0; bandIndex < options.compiledShape.bands.length; bandIndex++) {
    const band = options.compiledShape.bands[bandIndex]!
    const slots = getOrderedSlots(band.intervals, options.allSlots)

    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      const slot = slots[slotIndex]!
      const line = layoutNextLineFromDenseRepeatedText(
        options.densePattern,
        offset,
        slot.right - slot.left,
      )

      if (line === null) {
        continue
      }

      const x =
        options.align === 'center'
          ? slot.left + Math.max(0, (slot.right - slot.left - line.width) / 2)
          : slot.left
      const occupiedRight = Math.min(slot.right, x + Math.max(0, line.width))

      lines.push({
        ...line,
        x,
        top: band.top,
        baseline: band.top + options.compiledShape.bandHeight * options.baselineRatio,
        slot,
        font: options.font,
        fillPass: options.fillPass,
      })

      if (occupiedRight > x) {
        occupiedRects.push({
          left: x,
          right: occupiedRight,
          top: band.top,
          bottom: band.bottom,
        })
      }

      offset = line.end.tokenIndex
    }
  }

  return {
    lines,
    endOffset: offset,
    occupiedRects,
  }
}
