import type { Interval, LayoutCursor, LayoutTextInShapeOptions, ShapeTextLayout, ShapeTextLine } from '../types.js'
import { getBandIntervalsFromPolygon } from '../geometry/get-band-intervals-from-polygon.js'
import { getPolygonBounds } from '../geometry/get-polygon-bounds.js'
import { layoutNextLineFromPreparedText } from '../text/layout-next-line-from-prepared-text.js'
import { prepareTextForLayout } from '../text/prepare-text-for-layout.js'

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

export function layoutTextInShape(options: LayoutTextInShapeOptions): ShapeTextLayout {
  const prepared = prepareTextForLayout(options.text, options.font, options.measurer)
  const bounds = getPolygonBounds(options.shape.points)
  const align = options.align ?? 'left'
  const minSlotWidth = options.minSlotWidth ?? Math.max(16, options.lineHeight * 0.8)
  const baselineRatio = options.baselineRatio ?? 0.8
  const lines: ShapeTextLine[] = []
  let cursor: LayoutCursor = { tokenIndex: 0, graphemeIndex: 0 }
  let bandTop = bounds.top

  while (bandTop + options.lineHeight <= bounds.bottom) {
    const intervals = getBandIntervalsFromPolygon(
      options.shape.points,
      bandTop,
      bandTop + options.lineHeight,
      minSlotWidth,
    )

    if (intervals.length === 0) {
      bandTop += options.lineHeight
      continue
    }

    const slot = pickWidestInterval(intervals)
    const line = layoutNextLineFromPreparedText(prepared, cursor, slot.right - slot.left)
    if (line === null) break

    const x =
      align === 'center'
        ? slot.left + Math.max(0, (slot.right - slot.left - line.width) / 2)
        : slot.left

    lines.push({
      ...line,
      x,
      top: bandTop,
      baseline: bandTop + options.lineHeight * baselineRatio,
      slot,
    })

    cursor = line.end
    bandTop += options.lineHeight
  }

  return {
    font: options.font,
    lineHeight: options.lineHeight,
    shape: options.shape,
    bounds,
    lines,
    exhausted: cursor.tokenIndex >= prepared.tokens.length,
  }
}

