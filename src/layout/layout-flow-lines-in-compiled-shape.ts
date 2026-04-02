import type {
  AutoFillMode,
  CompiledShapeBands,
  LayoutCursor,
  PreparedLayoutText,
  PreparedLayoutToken,
  ShapeTextLine,
} from '../types.js'
import { layoutNextLineFromPreparedText } from '../text/layout-next-line-from-prepared-text.js'
import { layoutNextLineFromRepeatedText } from '../text/layout-next-line-from-repeated-text.js'
import { layoutDenseFillPass } from './layout-dense-fill-pass.js'

function pickWidestInterval(intervals: CompiledShapeBands['bands'][number]['intervals']) {
  let best = intervals[0]!

  for (let index = 1; index < intervals.length; index++) {
    const candidate = intervals[index]!
    if (candidate.right - candidate.left > best.right - best.left) {
      best = candidate
    }
  }

  return best
}

type LayoutFlowLinesInCompiledShapeOptions = {
  compiledShape: CompiledShapeBands
  prepared?: PreparedLayoutText
  densePattern?: PreparedLayoutToken
  autoFill: boolean
  autoFillMode: AutoFillMode
  align: 'left' | 'center'
  baselineRatio: number
  startCursor: LayoutCursor
}

export function layoutFlowLinesInCompiledShape(
  options: LayoutFlowLinesInCompiledShapeOptions,
): {
  lines: ShapeTextLine[]
  endCursor: LayoutCursor
} {
  const lines: ShapeTextLine[] = []
  let cursor: LayoutCursor = options.startCursor

  for (let index = 0; index < options.compiledShape.bands.length; index++) {
    const band = options.compiledShape.bands[index]!
    if (band.intervals.length === 0) {
      continue
    }

    const slot = pickWidestInterval(band.intervals)
    if (options.autoFill && options.autoFillMode === 'dense') {
      const denseLine =
        layoutDenseFillPass({
          compiledShape: {
            ...options.compiledShape,
            bands: [{ ...band, intervals: [slot] }],
          },
          densePattern: options.densePattern!,
          startOffset: cursor.tokenIndex,
          align: options.align,
          baselineRatio: options.baselineRatio,
          allSlots: false,
        }).lines[0] ?? null

      if (denseLine === null) {
        break
      }

      lines.push(denseLine)
      cursor = denseLine.end
      continue
    }

    const line = options.autoFill
      ? layoutNextLineFromRepeatedText(options.prepared!, cursor, slot.right - slot.left)
      : layoutNextLineFromPreparedText(options.prepared!, cursor, slot.right - slot.left)

    if (line === null) {
      break
    }

    const x =
      options.align === 'center'
        ? slot.left + Math.max(0, (slot.right - slot.left - line.width) / 2)
        : slot.left

    lines.push({
      ...line,
      x,
      top: band.top,
      baseline: band.top + options.compiledShape.bandHeight * options.baselineRatio,
      slot,
    })

    cursor = line.end
  }

  return {
    lines,
    endCursor: cursor,
  }
}
