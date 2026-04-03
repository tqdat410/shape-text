import type { CompiledShapeBands, SvgMaskShape } from '../types.js'
import { buildTextMaskBandsFromAlpha } from './build-text-mask-bands-from-alpha.js'
import {
  getSvgMaskPlacement,
  renderSvgMaskRaster,
} from './render-svg-mask-raster.js'
import {
  resolveSvgMaskShapeSize,
  resolveSvgMaskViewBox,
} from './resolve-svg-mask-shape-size.js'

const MAX_MASK_PIXELS = 4_000_000
const MAX_CACHE_SIZE = 64
const compiledShapeCache = new Map<string, CompiledShapeBands>()

function cacheSet(key: string, value: CompiledShapeBands): void {
  if (compiledShapeCache.has(key)) {
    compiledShapeCache.delete(key)
  } else if (compiledShapeCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = compiledShapeCache.keys().next().value
    if (oldestKey !== undefined) {
      compiledShapeCache.delete(oldestKey)
    }
  }

  compiledShapeCache.set(key, value)
}

function validateSvgMaskShape(
  shape: SvgMaskShape,
  size: ReturnType<typeof resolveSvgMaskShapeSize>,
): void {
  if (shape.path.trim().length === 0) {
    throw new Error('svg-mask shape needs a non-empty path value')
  }

  resolveSvgMaskViewBox(shape.viewBox)

  const maskScale = shape.maskScale ?? 2
  if (!Number.isFinite(maskScale) || maskScale <= 0) {
    throw new Error('svg-mask maskScale must be a finite positive number')
  }

  const pixelWidth = Math.max(1, Math.ceil(size.width * maskScale))
  const pixelHeight = Math.max(1, Math.ceil(size.height * maskScale))
  if (pixelWidth * pixelHeight > MAX_MASK_PIXELS) {
    throw new Error('svg-mask raster request is too large')
  }

  const alphaThreshold = shape.alphaThreshold ?? 16
  if (!Number.isFinite(alphaThreshold) || alphaThreshold < 0 || alphaThreshold > 255) {
    throw new Error('svg-mask alphaThreshold must be between 0 and 255')
  }
}

function buildCacheKey(
  shape: SvgMaskShape,
  size: ReturnType<typeof resolveSvgMaskShapeSize>,
  lineHeight: number,
  minSlotWidth: number,
): string {
  return JSON.stringify({
    kind: shape.kind,
    path: shape.path,
    viewBox: resolveSvgMaskViewBox(shape.viewBox),
    sizeMode: size.mode,
    width: size.width,
    height: size.height,
    padding: size.padding,
    maskScale: shape.maskScale ?? 2,
    alphaThreshold: shape.alphaThreshold ?? 16,
    lineHeight,
    minSlotWidth,
  })
}

function freezeCompiledShape(compiledShape: CompiledShapeBands): CompiledShapeBands {
  for (let bandIndex = 0; bandIndex < compiledShape.bands.length; bandIndex++) {
    const band = compiledShape.bands[bandIndex]!
    for (let intervalIndex = 0; intervalIndex < band.intervals.length; intervalIndex++) {
      Object.freeze(band.intervals[intervalIndex]!)
    }

    Object.freeze(band.intervals)
    Object.freeze(band)
  }

  Object.freeze(compiledShape.bounds)
  Object.freeze(compiledShape.source)
  Object.freeze(compiledShape.debugView)
  Object.freeze(compiledShape.bands)
  return Object.freeze(compiledShape)
}

export function compileSvgMaskShapeForLayout(
  shape: SvgMaskShape,
  lineHeight: number,
  minSlotWidth: number,
): CompiledShapeBands {
  const size = resolveSvgMaskShapeSize(shape)
  validateSvgMaskShape(shape, size)

  const cacheKey = buildCacheKey(shape, size, lineHeight, minSlotWidth)
  const cachedShape = compiledShapeCache.get(cacheKey)
  if (cachedShape !== undefined) {
    compiledShapeCache.delete(cacheKey)
    compiledShapeCache.set(cacheKey, cachedShape)
    return cachedShape
  }

  const viewBox = resolveSvgMaskViewBox(shape.viewBox)
  const placement = getSvgMaskPlacement(shape, size)
  const { imageData } = renderSvgMaskRaster(shape, size, placement)
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
    debugView: {
      kind: 'path',
      path: shape.path,
      x: placement.x - viewBox.x * placement.scaleX,
      y: placement.y - viewBox.y * placement.scaleY,
      scaleX: placement.scaleX,
      scaleY: placement.scaleY,
    },
  }

  if (compiledShape.bands.every(band => band.intervals.length === 0)) {
    throw new Error('svg-mask shape produced no visible fill area')
  }

  const frozenShape = freezeCompiledShape(compiledShape)
  cacheSet(cacheKey, frozenShape)
  return frozenShape
}
