import type { LayoutTextInCompiledShapeOptions, ShapeTextLayout } from '../types.js'
import { compileShapeForLayout } from '../shape/compile-shape-for-layout.js'
import { resolveLayoutTextStyle } from '../text/normalize-text-style-to-font.js'
import { prepareStreamRepeatFillPattern } from '../text/prepare-stream-repeat-fill-pattern.js'
import { layoutDenseFillPass } from './layout-dense-fill-pass.js'

const MAX_FILL_BASE_MIN_SLOT_WIDTH_FACTOR = 0.45
const MIN_MAX_FILL_SLOT_WIDTH = 6

function resolveMaxFillMinSlotWidth(lineHeight: number, factor: number): number {
  return Math.max(MIN_MAX_FILL_SLOT_WIDTH, Math.round(lineHeight * factor))
}

function ensureMaxFillCompiledShape(options: LayoutTextInCompiledShapeOptions) {
  const recommendedMinSlotWidth = resolveMaxFillMinSlotWidth(
    options.compiledShape.bandHeight,
    MAX_FILL_BASE_MIN_SLOT_WIDTH_FACTOR,
  )
  if (options.compiledShape.minSlotWidth <= recommendedMinSlotWidth) {
    return options.compiledShape
  }

  return compileShapeForLayout({
    shape: options.compiledShape.source,
    lineHeight: options.compiledShape.bandHeight,
    minSlotWidth: recommendedMinSlotWidth,
  })
}

export function resolveMaxFillLayout(
  options: LayoutTextInCompiledShapeOptions,
): ShapeTextLayout {
  const resolvedTextStyle = resolveLayoutTextStyle({
    font: options.font,
    textStyle: options.textStyle,
  })
  const baselineRatio = options.baselineRatio ?? 0.8
  const maxCompiledShape = ensureMaxFillCompiledShape(options)
  const streamPattern = prepareStreamRepeatFillPattern(
    options.text,
    resolvedTextStyle.font,
    options.measurer,
  )

  const pass = layoutDenseFillPass({
    compiledShape: maxCompiledShape,
    densePattern: streamPattern,
    startOffset: 0,
    align: 'left',
    baselineRatio,
    allSlots: true,
    fillPass: 1,
  })

  return {
    font: resolvedTextStyle.font,
    textStyle: resolvedTextStyle,
    lineHeight: maxCompiledShape.bandHeight,
    shape: maxCompiledShape.source,
    compiledShape: maxCompiledShape,
    bounds: maxCompiledShape.bounds,
    lines: pass.lines,
    exhausted: false,
    autoFill: true,
    autoFillMode: 'stream',
    fillStrategy: 'max',
  }
}
