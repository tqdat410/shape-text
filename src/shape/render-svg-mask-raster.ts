import type { SvgMaskShape } from '../types.js'
import { createBrowserCanvas2DContext } from '../text/create-browser-canvas-2d-context.js'
import {
  resolveSvgMaskViewBox,
  type ResolvedSvgMaskShapeSize,
} from './resolve-svg-mask-shape-size.js'

export type SvgMaskPlacement = {
  x: number
  y: number
  width: number
  height: number
  scaleX: number
  scaleY: number
}

export type SvgMaskCanvas = {
  context: ReturnType<typeof createBrowserCanvas2DContext>
  imageData: ImageData
}

export function getSvgMaskPlacement(
  shape: SvgMaskShape,
  size: ResolvedSvgMaskShapeSize,
): SvgMaskPlacement {
  const viewBox = resolveSvgMaskViewBox(shape.viewBox)
  const innerWidth = Math.max(0, size.width - size.padding * 2)
  const innerHeight = Math.max(0, size.height - size.padding * 2)
  const scale = Math.min(innerWidth / viewBox.width, innerHeight / viewBox.height)
  const width = viewBox.width * scale
  const height = viewBox.height * scale

  return {
    x: size.padding + Math.max(0, (innerWidth - width) / 2),
    y: size.padding + Math.max(0, (innerHeight - height) / 2),
    width,
    height,
    scaleX: scale,
    scaleY: scale,
  }
}

export function renderSvgMaskRaster(
  shape: SvgMaskShape,
  size: ResolvedSvgMaskShapeSize,
  placement = getSvgMaskPlacement(shape, size),
): SvgMaskCanvas {
  const maskScale = shape.maskScale ?? 2
  const pixelWidth = Math.max(1, Math.ceil(size.width * maskScale))
  const pixelHeight = Math.max(1, Math.ceil(size.height * maskScale))
  const context = createBrowserCanvas2DContext(pixelWidth, pixelHeight)
  const viewBox = resolveSvgMaskViewBox(shape.viewBox)

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, pixelWidth, pixelHeight)
  context.setTransform(
    placement.scaleX * maskScale,
    0,
    0,
    placement.scaleY * maskScale,
    (placement.x - viewBox.x * placement.scaleX) * maskScale,
    (placement.y - viewBox.y * placement.scaleY) * maskScale,
  )
  context.fillStyle = '#000000'
  context.fill(new Path2D(shape.path))

  return {
    context,
    imageData: context.getImageData(0, 0, pixelWidth, pixelHeight),
  }
}
