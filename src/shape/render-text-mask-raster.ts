import type { TextMaskShape } from '../types.js'
import { createBrowserCanvas2DContext } from '../text/create-browser-canvas-2d-context.js'
import type { ResolvedTextMaskSize, TextMaskContentMetrics } from './resolve-text-mask-shape-size.js'

export type TextMaskPlacement = {
  x: number
  baseline: number
}

export type TextMaskCanvas = {
  context: ReturnType<typeof createBrowserCanvas2DContext>
  imageData: ImageData
}

export function getTextMaskPlacement(
  size: ResolvedTextMaskSize,
  metrics: TextMaskContentMetrics,
): TextMaskPlacement {
  const innerWidth = Math.max(0, size.width - size.padding * 2)
  const innerHeight = Math.max(0, size.height - size.padding * 2)
  const left = size.padding + Math.max(0, (innerWidth - metrics.width) / 2)
  const top = size.padding + Math.max(0, (innerHeight - metrics.height) / 2)

  return {
    x: left + metrics.left,
    baseline: top + metrics.ascent,
  }
}

export function renderTextMaskRaster(
  shape: TextMaskShape,
  size: ResolvedTextMaskSize,
  text = shape.text,
  drawX?: number,
  baseline?: number,
): TextMaskCanvas {
  const maskScale = shape.maskScale ?? 2
  const pixelWidth = Math.max(1, Math.ceil(size.width * maskScale))
  const pixelHeight = Math.max(1, Math.ceil(size.height * maskScale))
  const context = createBrowserCanvas2DContext(pixelWidth, pixelHeight)

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, pixelWidth, pixelHeight)
  context.setTransform(maskScale, 0, 0, maskScale, 0, 0)
  context.font = shape.font
  context.fillStyle = '#000000'
  context.textBaseline = 'alphabetic'
  context.fillText(text, drawX ?? 0, baseline ?? 0)

  return {
    context,
    imageData: context.getImageData(0, 0, pixelWidth, pixelHeight),
  }
}
