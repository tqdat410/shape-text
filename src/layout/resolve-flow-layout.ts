import type { LayoutTextInCompiledShapeOptions, ShapeTextLayout } from '../types.js'
import { resolveLayoutTextStyle } from '../text/normalize-text-style-to-font.js'
import { prepareTextForLayout } from '../text/prepare-text-for-layout.js'
import { layoutFlowLinesInCompiledShape } from './layout-flow-lines-in-compiled-shape.js'

export function resolveFlowLayout(
  options: LayoutTextInCompiledShapeOptions,
): ShapeTextLayout {
  const resolvedTextStyle = resolveLayoutTextStyle({
    font: options.font,
    textStyle: options.textStyle,
  })
  const align = options.align ?? 'left'
  const baselineRatio = options.baselineRatio ?? 0.8
  const prepared = prepareTextForLayout(
    options.text,
    resolvedTextStyle.font,
    options.measurer,
  )
  const { lines, endCursor } = layoutFlowLinesInCompiledShape({
    compiledShape: options.compiledShape,
    prepared,
    align,
    baselineRatio,
    startCursor: { tokenIndex: 0, graphemeIndex: 0 },
  })

  return {
    font: resolvedTextStyle.font,
    textStyle: resolvedTextStyle,
    lineHeight: options.compiledShape.bandHeight,
    shape: options.compiledShape.source,
    compiledShape: options.compiledShape,
    bounds: options.compiledShape.bounds,
    lines,
    exhausted: endCursor.tokenIndex >= prepared.tokens.length,
    autoFill: false,
  }
}
