import type { AutoFillMode, LayoutTextInCompiledShapeOptions, ShapeTextLayout } from '../types.js'
import { resolveLayoutTextStyle } from '../text/normalize-text-style-to-font.js'
import { prepareDenseRepeatFillPattern } from '../text/prepare-dense-repeat-fill-pattern.js'
import { prepareTextForLayout } from '../text/prepare-text-for-layout.js'
import { layoutFlowLinesInCompiledShape } from './layout-flow-lines-in-compiled-shape.js'

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
  const { lines, endCursor } = layoutFlowLinesInCompiledShape({
    compiledShape: options.compiledShape,
    prepared,
    densePattern,
    autoFill,
    autoFillMode,
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
    exhausted: autoFill
      ? autoFillMode === 'dense'
        ? false
        : prepared!.tokens.length === 0
      : endCursor.tokenIndex >= prepared!.tokens.length,
    autoFill,
    autoFillMode,
    fillStrategy: 'flow',
  }
}
