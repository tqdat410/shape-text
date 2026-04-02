import type { CompiledShapeBands, CompiledShapeRegion, TextMaskShape } from '../types.js'
import { createBrowserCanvas2DContext } from '../text/create-browser-canvas-2d-context.js'
import { buildTextMaskBandsFromAlpha } from './build-text-mask-bands-from-alpha.js'
import {
  getTextMaskPlacement,
  renderTextMaskRaster,
  type TextMaskCanvas,
  type TextMaskPlacement,
} from './render-text-mask-raster.js'
import {
  measureTextMaskContent,
  resolveTextMaskShapeSize,
  type ResolvedTextMaskSize,
} from './resolve-text-mask-shape-size.js'
import { segmentTextMaskGraphemes } from './segment-text-mask-graphemes.js'

const MAX_MASK_PIXELS = 4_000_000
const compiledShapeCache = new Map<string, CompiledShapeBands>()

function validateTextMaskShape(shape: TextMaskShape, size: ResolvedTextMaskSize): void {
  if (shape.text.length === 0) {
    throw new Error('text-mask shape needs a non-empty text value')
  }

  const shapeTextMode = shape.shapeTextMode ?? 'whole-text'
  if (shapeTextMode !== 'whole-text' && shapeTextMode !== 'per-character') {
    throw new Error('text-mask shapeTextMode must be whole-text or per-character')
  }

  const maskScale = shape.maskScale ?? 2
  if (!Number.isFinite(maskScale) || maskScale <= 0) {
    throw new Error('text-mask maskScale must be a finite positive number')
  }

  const pixelWidth = Math.max(1, Math.ceil(size.width * maskScale))
  const pixelHeight = Math.max(1, Math.ceil(size.height * maskScale))
  if (pixelWidth * pixelHeight > MAX_MASK_PIXELS) {
    throw new Error('text-mask raster request is too large')
  }

  const alphaThreshold = shape.alphaThreshold ?? 16
  if (!Number.isFinite(alphaThreshold) || alphaThreshold < 0 || alphaThreshold > 255) {
    throw new Error('text-mask alphaThreshold must be between 0 and 255')
  }
}

function buildCacheKey(
  shape: TextMaskShape,
  size: ResolvedTextMaskSize,
  lineHeight: number,
  minSlotWidth: number,
): string {
  return JSON.stringify({
    kind: shape.kind,
    text: shape.text,
    font: shape.font,
    sizeMode: size.mode,
    width: size.width,
    height: size.height,
    shapeTextMode: shape.shapeTextMode ?? 'whole-text',
    padding: size.padding,
    maskScale: shape.maskScale ?? 2,
    alphaThreshold: shape.alphaThreshold ?? 16,
    lineHeight,
    minSlotWidth,
  })
}

function isFontReadyForShape(shape: TextMaskShape): boolean {
  if (typeof document === 'undefined' || document.fonts === undefined) {
    return true
  }

  try {
    return document.fonts.check(shape.font, shape.text)
  } catch {
    return true
  }
}

function freezeCompiledShape(compiledShape: CompiledShapeBands): CompiledShapeBands {
  freezeBands(compiledShape.bands)
  freezeRegions(compiledShape.regions ?? [])

  Object.freeze(compiledShape.bounds)
  Object.freeze(compiledShape.source)
  Object.freeze(compiledShape.debugView)
  Object.freeze(compiledShape.bands)
  if (compiledShape.regions !== undefined) {
    Object.freeze(compiledShape.regions)
  }
  return Object.freeze(compiledShape)
}

function freezeBands(bands: CompiledShapeBands['bands']): void {
  for (let bandIndex = 0; bandIndex < bands.length; bandIndex++) {
    const band = bands[bandIndex]!
    for (let intervalIndex = 0; intervalIndex < band.intervals.length; intervalIndex++) {
      Object.freeze(band.intervals[intervalIndex]!)
    }

    Object.freeze(band.intervals)
    Object.freeze(band)
  }
}

function freezeRegions(regions: CompiledShapeRegion[]): void {
  for (let index = 0; index < regions.length; index++) {
    const region = regions[index]!
    freezeBands(region.bands)
    Object.freeze(region.bounds)
    Object.freeze(region.debugView)
    Object.freeze(region.bands)
    Object.freeze(region)
  }
}

function buildRegion(
  shape: TextMaskShape,
  size: ResolvedTextMaskSize,
  lineHeight: number,
  minSlotWidth: number,
  index: number,
  grapheme: string,
  drawX: number,
  baseline: number,
): CompiledShapeRegion {
  const { imageData } = renderTextMaskRaster(shape, size, grapheme, drawX, baseline)

  return {
    index,
    grapheme,
    bounds: { left: 0, top: 0, right: size.width, bottom: size.height },
    bands: buildTextMaskBandsFromAlpha(
      {
        width: size.width,
        height: size.height,
        maskScale: shape.maskScale ?? 2,
        alphaThreshold: shape.alphaThreshold ?? 16,
      },
      imageData.data,
      lineHeight,
      minSlotWidth,
    ),
    debugView: {
      kind: 'text',
      text: grapheme,
      font: shape.font,
      x: drawX,
      baseline,
    },
  }
}

function buildRegions(
  shape: TextMaskShape,
  size: ResolvedTextMaskSize,
  context: TextMaskCanvas['context'],
  placement: TextMaskPlacement,
  lineHeight: number,
  minSlotWidth: number,
): CompiledShapeRegion[] {
  if ((shape.shapeTextMode ?? 'whole-text') !== 'per-character') {
    return []
  }

  return segmentTextMaskGraphemes(shape.text, placement.x, value => context.measureText(value).width)
    .filter(placementEntry => !placementEntry.isWhitespace)
    .map((placementEntry, index) =>
      buildRegion(
        shape,
        size,
        lineHeight,
        minSlotWidth,
        index,
        placementEntry.grapheme,
        placementEntry.drawX,
        placement.baseline,
      ),
    )
    .filter(region => region.bands.some(band => band.intervals.length > 0))
}

export function compileTextMaskShapeForLayout(
  shape: TextMaskShape,
  lineHeight: number,
  minSlotWidth: number,
): CompiledShapeBands {
  const context = createBrowserCanvas2DContext(1, 1)
  const contentMetrics = measureTextMaskContent(context, shape)
  const size = resolveTextMaskShapeSize(shape, contentMetrics)
  validateTextMaskShape(shape, size)

  const fontReadyForCache = isFontReadyForShape(shape)
  const cacheKey = buildCacheKey(shape, size, lineHeight, minSlotWidth)
  const cachedShape = fontReadyForCache ? compiledShapeCache.get(cacheKey) : undefined
  if (cachedShape !== undefined) {
    return cachedShape
  }

  const placement = getTextMaskPlacement(size, contentMetrics)
  const { imageData } = renderTextMaskRaster(shape, size, shape.text, placement.x, placement.baseline)
  const compiledShape: CompiledShapeBands = {
    kind: shape.kind,
    source: shape,
    bounds: { left: 0, top: 0, right: size.width, bottom: size.height },
    bandHeight: lineHeight,
    minSlotWidth,
    bands: buildTextMaskBandsFromAlpha(
      {
        width: size.width,
        height: size.height,
        maskScale: shape.maskScale ?? 2,
        alphaThreshold: shape.alphaThreshold ?? 16,
      },
      imageData.data,
      lineHeight,
      minSlotWidth,
    ),
    regions: buildRegions(shape, size, context, placement, lineHeight, minSlotWidth),
    debugView: {
      kind: 'text',
      text: shape.text,
      font: shape.font,
      x: placement.x,
      baseline: placement.baseline,
    },
  }

  if (compiledShape.bands.every(band => band.intervals.length === 0)) {
    throw new Error('text-mask shape produced no visible fill area')
  }

  const frozenShape = freezeCompiledShape(compiledShape)
  if (fontReadyForCache) {
    compiledShapeCache.set(cacheKey, frozenShape)
  }

  return frozenShape
}
