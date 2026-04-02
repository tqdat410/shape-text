import type {
  CompiledShapeBands,
  CompiledShapeRegion,
  LayoutCursor,
  LayoutTextInCompiledShapeOptions,
  ShapeTextLayout,
} from '../types.js'
import { resolveLayoutTextStyle } from '../text/normalize-text-style-to-font.js'
import { prepareStreamRepeatFillPattern } from '../text/prepare-stream-repeat-fill-pattern.js'
import { prepareTextForLayout } from '../text/prepare-text-for-layout.js'
import { layoutDenseFillPass } from './layout-dense-fill-pass.js'
import { layoutFlowLinesInCompiledShape } from './layout-flow-lines-in-compiled-shape.js'
import { ensureMaxFillCompiledShape } from './resolve-max-fill-helpers.js'

function createCompiledShapeFromRegion(
  compiledShape: CompiledShapeBands,
  region: CompiledShapeRegion,
): CompiledShapeBands {
  return {
    kind: compiledShape.kind,
    source: compiledShape.source,
    bounds: region.bounds,
    bandHeight: compiledShape.bandHeight,
    minSlotWidth: compiledShape.minSlotWidth,
    bands: region.bands,
    debugView: region.debugView,
  }
}

export function hasSequentialShapeRegions(compiledShape: CompiledShapeBands): boolean {
  return (
    compiledShape.source.kind === 'text-mask' &&
    (compiledShape.source.shapeTextMode ?? 'whole-text') === 'per-character' &&
    (compiledShape.regions?.some(region =>
      region.bands.some(band => band.intervals.length > 0),
    ) ?? false)
  )
}

export function resolveSequentialShapeRegions(
  options: LayoutTextInCompiledShapeOptions,
): ShapeTextLayout {
  const autoFill = options.autoFill ?? false
  const resolvedTextStyle = resolveLayoutTextStyle({
    font: options.font,
    textStyle: options.textStyle,
  })
  const align = options.align ?? 'left'
  const baselineRatio = options.baselineRatio ?? 0.8
  const compiledShape = autoFill
    ? ensureMaxFillCompiledShape(options.compiledShape)
    : options.compiledShape
  const regions = compiledShape.regions ?? []

  if (autoFill) {
    const streamPattern = prepareStreamRepeatFillPattern(
      options.text,
      resolvedTextStyle.font,
      options.measurer,
    )
    const lines = []
    let offset = 0

    for (let index = 0; index < regions.length; index++) {
      const regionShape = createCompiledShapeFromRegion(compiledShape, regions[index]!)
      const pass = layoutDenseFillPass({
        compiledShape: regionShape,
        densePattern: streamPattern,
        startOffset: offset,
        align: 'left',
        baselineRatio,
        allSlots: true,
        fillPass: 1,
      })

      lines.push(...pass.lines)
      offset = pass.endOffset
    }

    return {
      font: resolvedTextStyle.font,
      textStyle: resolvedTextStyle,
      lineHeight: compiledShape.bandHeight,
      shape: compiledShape.source,
      compiledShape,
      bounds: compiledShape.bounds,
      lines,
      exhausted: false,
      autoFill: true,
    }
  }

  const prepared = prepareTextForLayout(
    options.text,
    resolvedTextStyle.font,
    options.measurer,
  )
  const lines = []
  let cursor: LayoutCursor = { tokenIndex: 0, graphemeIndex: 0 }

  for (let index = 0; index < regions.length; index++) {
    const regionShape = createCompiledShapeFromRegion(compiledShape, regions[index]!)
    const result = layoutFlowLinesInCompiledShape({
      compiledShape: regionShape,
      prepared,
      align,
      baselineRatio,
      startCursor: cursor,
    })

    lines.push(...result.lines)
    cursor = result.endCursor

    if (!autoFill && prepared !== undefined && cursor.tokenIndex >= prepared.tokens.length) {
      break
    }
  }

  return {
    font: resolvedTextStyle.font,
    textStyle: resolvedTextStyle,
    lineHeight: compiledShape.bandHeight,
    shape: compiledShape.source,
    compiledShape,
    bounds: compiledShape.bounds,
    lines,
    exhausted: cursor.tokenIndex >= prepared.tokens.length,
    autoFill: false,
  }
}
