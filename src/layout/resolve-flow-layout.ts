import type {
  AutoFillMode,
  Interval,
  LayoutCursor,
  LayoutTextInCompiledShapeOptions,
  ShapeTextLayout,
  ShapeTextLine,
} from '../types.js'
import { layoutNextLineFromPreparedText } from '../text/layout-next-line-from-prepared-text.js'
import { layoutNextLineFromRepeatedText } from '../text/layout-next-line-from-repeated-text.js'
import { resolveLayoutTextStyle } from '../text/normalize-text-style-to-font.js'
import { prepareDenseRepeatFillPattern } from '../text/prepare-dense-repeat-fill-pattern.js'
import { prepareTextForLayout } from '../text/prepare-text-for-layout.js'
import { layoutDenseFillPass } from './layout-dense-fill-pass.js'

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

export function resolveFlowLayout(
  options: LayoutTextInCompiledShapeOptions,
  autoFillMode: AutoFillMode,
): ShapeTextLayout {
  const resolvedTextStyle = resolveLayoutTextStyle({
    font: options.font,
    textStyle: options.textStyle,
  })
  const align = options.align ?? 'left'
  const baselineRatio = options.baselineRatio ?? 0.8
  const autoFill = options.autoFill ?? false
  const prepared =
    autoFillMode === 'dense'
      ? undefined
      : prepareTextForLayout(options.text, resolvedTextStyle.font, options.measurer)
  const densePattern =
    autoFillMode === 'dense'
      ? prepareDenseRepeatFillPattern(options.text, resolvedTextStyle.font, options.measurer)
      : undefined
  const lines: ShapeTextLine[] = []
  let cursor: LayoutCursor = { tokenIndex: 0, graphemeIndex: 0 }

  for (let index = 0; index < options.compiledShape.bands.length; index++) {
    const band = options.compiledShape.bands[index]!
    if (band.intervals.length === 0) {
      continue
    }

    const slot = pickWidestInterval(band.intervals)
    if (autoFill && autoFillMode === 'dense') {
      const denseLine =
        layoutDenseFillPass({
          compiledShape: {
            ...options.compiledShape,
            bands: [{ ...band, intervals: [slot] }],
          },
          densePattern: densePattern!,
          startOffset: cursor.tokenIndex,
          align,
          baselineRatio,
          allSlots: false,
        }).lines[0] ?? null

      if (denseLine === null) {
        break
      }

      lines.push(denseLine)
      cursor = denseLine.end
      continue
    }

    const line = autoFill
      ? layoutNextLineFromRepeatedText(prepared!, cursor, slot.right - slot.left)
      : layoutNextLineFromPreparedText(prepared!, cursor, slot.right - slot.left)

    if (line === null) {
      break
    }

    const x =
      align === 'center'
        ? slot.left + Math.max(0, (slot.right - slot.left - line.width) / 2)
        : slot.left

    lines.push({
      ...line,
      x,
      top: band.top,
      baseline: band.top + options.compiledShape.bandHeight * baselineRatio,
      slot,
    })

    cursor = line.end
  }

  return {
    font: resolvedTextStyle.font,
    textStyle: resolvedTextStyle,
    lineHeight: options.compiledShape.bandHeight,
    shape: options.compiledShape.source,
    compiledShape: options.compiledShape,
    bounds: options.compiledShape.bounds,
    lines,
    exhausted: autoFill
      ? autoFillMode === 'dense'
        ? false
        : prepared!.tokens.length === 0
      : cursor.tokenIndex >= prepared!.tokens.length,
    autoFill,
    autoFillMode,
    fillStrategy: 'flow',
  }
}
