import type { ShapeInput } from 'shape-text'

import {
  createDefaultGeometryShape,
  createDefaultSvgMaskShape,
  createDefaultTextMaskShape,
} from './demo-model'
import { assertObject, hasOwnProperty, readFiniteNumber } from './demo-payload-primitives'

export function mergeDemoShapePayload(currentShape: ShapeInput, shape: Record<string, unknown>): ShapeInput {
  const shapeKind =
    shape.kind === 'text-mask' || shape.kind === 'polygon' || shape.kind === 'svg-mask'
      ? shape.kind
      : currentShape.kind

  if (shapeKind === 'text-mask') {
    const baseShape = currentShape.kind === 'text-mask' ? currentShape : createDefaultTextMaskShape()
    const size = hasOwnProperty(shape, 'size') && shape.size !== undefined
      ? assertObject(shape.size, 'payload.layout.shape.size')
      : {}
    const nextSizeMode = hasOwnProperty(size, 'mode')
      ? size.mode === 'fixed' ? 'fixed' : 'fit-content'
      : baseShape.size?.mode === 'fixed' ? 'fixed' : 'fit-content'
    const nextPadding = hasOwnProperty(size, 'padding')
      ? size.padding === undefined ? undefined : readFiniteNumber(size.padding, 'payload.layout.shape.size.padding', true)
      : baseShape.size?.padding

    return {
      kind: 'text-mask',
      text: hasOwnProperty(shape, 'text') ? String(shape.text) : baseShape.text,
      font: hasOwnProperty(shape, 'font') ? String(shape.font) : baseShape.font,
      size: nextSizeMode === 'fixed'
        ? {
            mode: 'fixed',
            width: hasOwnProperty(size, 'width')
              ? readFiniteNumber(size.width, 'payload.layout.shape.size.width')
              : baseShape.size?.mode === 'fixed' ? baseShape.size.width : 520,
            height: hasOwnProperty(size, 'height')
              ? readFiniteNumber(size.height, 'payload.layout.shape.size.height')
              : baseShape.size?.mode === 'fixed' ? baseShape.size.height : 260,
            padding: nextPadding,
          }
        : { mode: 'fit-content', padding: nextPadding },
      shapeTextMode: hasOwnProperty(shape, 'shapeTextMode')
        ? shape.shapeTextMode === 'per-character' ? 'per-character' : 'whole-text'
        : baseShape.shapeTextMode,
      maskScale: hasOwnProperty(shape, 'maskScale')
        ? shape.maskScale === undefined ? undefined : readFiniteNumber(shape.maskScale, 'payload.layout.shape.maskScale')
        : baseShape.maskScale,
      alphaThreshold: hasOwnProperty(shape, 'alphaThreshold')
        ? shape.alphaThreshold === undefined ? undefined : readFiniteNumber(shape.alphaThreshold, 'payload.layout.shape.alphaThreshold', true)
        : baseShape.alphaThreshold,
    }
  }

  if (shapeKind === 'svg-mask') {
    const baseShape = currentShape.kind === 'svg-mask' ? currentShape : createDefaultSvgMaskShape()
    const viewBox = hasOwnProperty(shape, 'viewBox') && shape.viewBox !== undefined
      ? assertObject(shape.viewBox, 'payload.layout.shape.viewBox')
      : {}
    const size = hasOwnProperty(shape, 'size') && shape.size !== undefined
      ? assertObject(shape.size, 'payload.layout.shape.size')
      : {}
    const nextSizeMode = hasOwnProperty(size, 'mode')
      ? size.mode === 'fixed' ? 'fixed' : 'fit-content'
      : baseShape.size?.mode === 'fixed' ? 'fixed' : 'fit-content'
    const nextPadding = hasOwnProperty(size, 'padding')
      ? size.padding === undefined ? undefined : readFiniteNumber(size.padding, 'payload.layout.shape.size.padding', true)
      : baseShape.size?.padding

    return {
      kind: 'svg-mask',
      path: hasOwnProperty(shape, 'path') ? String(shape.path) : baseShape.path,
      viewBox: {
        x: hasOwnProperty(viewBox, 'x') ? readFiniteNumber(viewBox.x, 'payload.layout.shape.viewBox.x', true) : (baseShape.viewBox.x ?? 0),
        y: hasOwnProperty(viewBox, 'y') ? readFiniteNumber(viewBox.y, 'payload.layout.shape.viewBox.y', true) : (baseShape.viewBox.y ?? 0),
        width: hasOwnProperty(viewBox, 'width') ? readFiniteNumber(viewBox.width, 'payload.layout.shape.viewBox.width') : baseShape.viewBox.width,
        height: hasOwnProperty(viewBox, 'height') ? readFiniteNumber(viewBox.height, 'payload.layout.shape.viewBox.height') : baseShape.viewBox.height,
      },
      size: nextSizeMode === 'fixed'
        ? {
            mode: 'fixed',
            width: hasOwnProperty(size, 'width')
              ? readFiniteNumber(size.width, 'payload.layout.shape.size.width')
              : baseShape.size?.mode === 'fixed' ? baseShape.size.width : 360,
            height: hasOwnProperty(size, 'height')
              ? readFiniteNumber(size.height, 'payload.layout.shape.size.height')
              : baseShape.size?.mode === 'fixed' ? baseShape.size.height : 260,
            padding: nextPadding,
          }
        : { mode: 'fit-content', padding: nextPadding },
      maskScale: hasOwnProperty(shape, 'maskScale')
        ? shape.maskScale === undefined ? undefined : readFiniteNumber(shape.maskScale, 'payload.layout.shape.maskScale')
        : baseShape.maskScale,
      alphaThreshold: hasOwnProperty(shape, 'alphaThreshold')
        ? shape.alphaThreshold === undefined ? undefined : readFiniteNumber(shape.alphaThreshold, 'payload.layout.shape.alphaThreshold', true)
        : baseShape.alphaThreshold,
    }
  }

  const baseShape = currentShape.kind === 'polygon' ? currentShape : createDefaultGeometryShape('digit-two')
  if (!hasOwnProperty(shape, 'points')) return baseShape

  const points = Array.isArray(shape.points) ? shape.points : null
  if (points === null || points.length < 3) {
    throw new Error('payload.layout.shape.points must contain at least 3 points')
  }

  return {
    kind: 'polygon',
    points: points.map((point, index) => {
      const value = assertObject(point, `payload.layout.shape.points[${index}]`)
      return {
        x: readFiniteNumber(value.x, `payload.layout.shape.points[${index}].x`, true),
        y: readFiniteNumber(value.y, `payload.layout.shape.points[${index}].y`, true),
      }
    }),
  }
}
