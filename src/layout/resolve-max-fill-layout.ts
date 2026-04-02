import type { LayoutTextInCompiledShapeOptions, ShapeTextLayout } from '../types.js'
import { resolveLayoutTextStyle } from '../text/normalize-text-style-to-font.js'
import { prepareStreamRepeatFillPattern } from '../text/prepare-stream-repeat-fill-pattern.js'
import { layoutDenseFillPass } from './layout-dense-fill-pass.js'
import { ensureMaxFillCompiledShape } from './resolve-max-fill-helpers.js'

export function resolveMaxFillLayout(
  options: LayoutTextInCompiledShapeOptions,
): ShapeTextLayout {
  const resolvedTextStyle = resolveLayoutTextStyle({
    font: options.font,
    textStyle: options.textStyle,
  })
  const baselineRatio = options.baselineRatio ?? 0.8
  const maxCompiledShape = ensureMaxFillCompiledShape(options.compiledShape)
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
  }
}
