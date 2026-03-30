import type { CompiledShapeBand, CompiledShapeBands, Interval, TextMaskShape } from '../types.js'
import { createBrowserCanvas2DContext } from '../text/create-browser-canvas-2d-context.js'

type TextMaskPlacement = {
  x: number
  baseline: number
}

const MAX_MASK_PIXELS = 4_000_000
const compiledShapeCache = new Map<string, CompiledShapeBands>()

function validateTextMaskShape(shape: TextMaskShape): void {
  if (shape.text.length === 0) {
    throw new Error('text-mask shape needs a non-empty text value')
  }

  if (!Number.isFinite(shape.width) || shape.width <= 0) {
    throw new Error('text-mask width must be a finite positive number')
  }

  if (!Number.isFinite(shape.height) || shape.height <= 0) {
    throw new Error('text-mask height must be a finite positive number')
  }

  const maskScale = shape.maskScale ?? 2
  if (!Number.isFinite(maskScale) || maskScale <= 0) {
    throw new Error('text-mask maskScale must be a finite positive number')
  }

  const pixelWidth = Math.max(1, Math.ceil(shape.width * maskScale))
  const pixelHeight = Math.max(1, Math.ceil(shape.height * maskScale))
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
  lineHeight: number,
  minSlotWidth: number,
): string {
  return JSON.stringify({
    kind: shape.kind,
    text: shape.text,
    font: shape.font,
    width: shape.width,
    height: shape.height,
    padding: shape.padding ?? 0,
    maskScale: shape.maskScale ?? 2,
    alphaThreshold: shape.alphaThreshold ?? 16,
    lineHeight,
    minSlotWidth,
  })
}

function intersectIntervalSets(leftSet: Interval[], rightSet: Interval[]): Interval[] {
  const intersections: Interval[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < leftSet.length && rightIndex < rightSet.length) {
    const left = leftSet[leftIndex]!
    const right = rightSet[rightIndex]!
    const overlapLeft = Math.max(left.left, right.left)
    const overlapRight = Math.min(left.right, right.right)

    if (overlapRight > overlapLeft) {
      intersections.push({ left: overlapLeft, right: overlapRight })
    }

    if (left.right < right.right) {
      leftIndex += 1
    } else {
      rightIndex += 1
    }
  }

  return intersections
}

function getRowIntervals(
  alpha: Uint8ClampedArray,
  row: number,
  width: number,
  alphaThreshold: number,
): Interval[] {
  const intervals: Interval[] = []
  let start = -1
  const rowOffset = row * width * 4

  for (let x = 0; x < width; x++) {
    const isSolid = alpha[rowOffset + x * 4 + 3] >= alphaThreshold

    if (isSolid && start < 0) {
      start = x
      continue
    }

    if (!isSolid && start >= 0) {
      intervals.push({ left: start, right: x })
      start = -1
    }
  }

  if (start >= 0) {
    intervals.push({ left: start, right: width })
  }

  return intervals
}

function getTextMaskPlacement(shape: TextMaskShape, context: CanvasText['context']): TextMaskPlacement {
  const padding = shape.padding ?? 0
  context.font = shape.font
  const metrics = context.measureText(shape.text)
  const contentWidth =
    (metrics.actualBoundingBoxLeft ?? 0) + (metrics.actualBoundingBoxRight ?? metrics.width)
  const contentHeight =
    (metrics.actualBoundingBoxAscent ?? 0) + (metrics.actualBoundingBoxDescent ?? 0)
  const innerWidth = Math.max(0, shape.width - padding * 2)
  const innerHeight = Math.max(0, shape.height - padding * 2)
  const left = padding + Math.max(0, (innerWidth - contentWidth) / 2)
  const top = padding + Math.max(0, (innerHeight - contentHeight) / 2)

  return {
    x: left + (metrics.actualBoundingBoxLeft ?? 0),
    baseline: top + (metrics.actualBoundingBoxAscent ?? 0),
  }
}

type CanvasText = {
  context: ReturnType<typeof createBrowserCanvas2DContext>
  imageData: ImageData
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

function renderTextMask(shape: TextMaskShape): CanvasText {
  const maskScale = shape.maskScale ?? 2
  const pixelWidth = Math.max(1, Math.ceil(shape.width * maskScale))
  const pixelHeight = Math.max(1, Math.ceil(shape.height * maskScale))
  const context = createBrowserCanvas2DContext(pixelWidth, pixelHeight)

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, pixelWidth, pixelHeight)
  context.setTransform(maskScale, 0, 0, maskScale, 0, 0)
  context.font = shape.font
  context.fillStyle = '#000000'
  context.textBaseline = 'alphabetic'

  const placement = getTextMaskPlacement(shape, context)
  context.fillText(shape.text, placement.x, placement.baseline)

  return {
    context,
    imageData: context.getImageData(0, 0, pixelWidth, pixelHeight),
  }
}

function buildBands(
  shape: TextMaskShape,
  alpha: Uint8ClampedArray,
  lineHeight: number,
  minSlotWidth: number,
): CompiledShapeBand[] {
  const maskScale = shape.maskScale ?? 2
  const alphaThreshold = shape.alphaThreshold ?? 16
  const pixelWidth = Math.max(1, Math.ceil(shape.width * maskScale))
  const bands: CompiledShapeBand[] = []

  for (let bandTop = 0; bandTop + lineHeight <= shape.height; bandTop += lineHeight) {
    const startRow = Math.floor(bandTop * maskScale)
    const endRow = Math.max(startRow, Math.ceil((bandTop + lineHeight) * maskScale) - 1)
    let intervals: Interval[] | null = null

    for (let row = startRow; row <= endRow; row++) {
      const rowIntervals = getRowIntervals(alpha, row, pixelWidth, alphaThreshold)
      if (rowIntervals.length === 0) {
        intervals = []
        break
      }

      intervals = intervals === null ? rowIntervals : intersectIntervalSets(intervals, rowIntervals)
      if (intervals.length === 0) {
        break
      }
    }

    bands.push({
      top: bandTop,
      bottom: bandTop + lineHeight,
      intervals: (intervals ?? [])
        .map(interval => ({
          left: interval.left / maskScale,
          right: interval.right / maskScale,
        }))
        .filter(interval => interval.right - interval.left >= minSlotWidth),
    })
  }

  return bands
}

export function compileTextMaskShapeForLayout(
  shape: TextMaskShape,
  lineHeight: number,
  minSlotWidth: number,
): CompiledShapeBands {
  validateTextMaskShape(shape)
  const fontReadyForCache = isFontReadyForShape(shape)

  const cacheKey = buildCacheKey(shape, lineHeight, minSlotWidth)
  const cachedShape = fontReadyForCache ? compiledShapeCache.get(cacheKey) : undefined
  if (cachedShape !== undefined) {
    return cachedShape
  }

  const { context, imageData } = renderTextMask(shape)
  const placement = getTextMaskPlacement(shape, context)
  const compiledShape: CompiledShapeBands = {
    kind: shape.kind,
    source: shape,
    bounds: { left: 0, top: 0, right: shape.width, bottom: shape.height },
    bandHeight: lineHeight,
    minSlotWidth,
    bands: buildBands(shape, imageData.data, lineHeight, minSlotWidth),
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
