import type { DemoRequest } from './demo-model'

import { createDefaultGeometryShape, createDefaultTextMaskShape } from './demo-model'
import { assertObject, hasOwnProperty, readFiniteNumber } from './demo-payload-primitives'

export function mergeDemoLayoutPayload(target: DemoRequest, layout: Record<string, unknown>) {
  if (hasOwnProperty(layout, 'text')) {
    target.layout.text = String(layout.text)
  }

  if (hasOwnProperty(layout, 'lineHeight')) {
    target.layout.lineHeight = readFiniteNumber(layout.lineHeight, 'payload.layout.lineHeight')
  }

  if (hasOwnProperty(layout, 'autoFill')) {
    target.layout.autoFill = Boolean(layout.autoFill)
  }

  if (hasOwnProperty(layout, 'minSlotWidth')) {
    target.layout.minSlotWidth =
      layout.minSlotWidth === undefined
        ? undefined
        : readFiniteNumber(layout.minSlotWidth, 'payload.layout.minSlotWidth')
  }

  if (hasOwnProperty(layout, 'textStyle')) {
    const textStyle = assertObject(layout.textStyle, 'payload.layout.textStyle')
    target.layout.textStyle = {
      family: hasOwnProperty(textStyle, 'family')
        ? String(textStyle.family)
        : target.layout.textStyle.family,
      size: hasOwnProperty(textStyle, 'size')
        ? readFiniteNumber(textStyle.size, 'payload.layout.textStyle.size')
        : target.layout.textStyle.size,
      weight:
        typeof textStyle.weight === 'string' || typeof textStyle.weight === 'number'
          ? textStyle.weight
          : target.layout.textStyle.weight,
      style: hasOwnProperty(textStyle, 'style')
        ? textStyle.style === 'italic' || textStyle.style === 'oblique'
          ? textStyle.style
          : 'normal'
        : target.layout.textStyle.style,
      color: hasOwnProperty(textStyle, 'color')
        ? String(textStyle.color)
        : target.layout.textStyle.color,
    }
  }

  if (!hasOwnProperty(layout, 'shape')) {
    return
  }

  const shape = assertObject(layout.shape, 'payload.layout.shape')
  const shapeKind =
    shape.kind === 'text-mask' || shape.kind === 'polygon' ? shape.kind : target.layout.shape.kind

  if (shapeKind === 'text-mask') {
    const baseShape =
      target.layout.shape.kind === 'text-mask' ? target.layout.shape : createDefaultTextMaskShape()
    const size =
      hasOwnProperty(shape, 'size') && shape.size !== undefined
        ? assertObject(shape.size, 'payload.layout.shape.size')
        : {}
    const nextSizeMode = hasOwnProperty(size, 'mode')
      ? size.mode === 'fixed'
        ? 'fixed'
        : 'fit-content'
      : baseShape.size?.mode === 'fixed'
        ? 'fixed'
        : 'fit-content'
    const nextPadding = hasOwnProperty(size, 'padding')
      ? size.padding === undefined
        ? undefined
        : readFiniteNumber(size.padding, 'payload.layout.shape.size.padding', true)
      : baseShape.size?.padding

    target.layout.shape = {
      kind: 'text-mask',
      text: hasOwnProperty(shape, 'text') ? String(shape.text) : baseShape.text,
      font: hasOwnProperty(shape, 'font') ? String(shape.font) : baseShape.font,
      size:
        nextSizeMode === 'fixed'
          ? {
              mode: 'fixed',
              width: hasOwnProperty(size, 'width')
                ? readFiniteNumber(size.width, 'payload.layout.shape.size.width')
                : baseShape.size?.mode === 'fixed'
                  ? baseShape.size.width
                  : 520,
              height: hasOwnProperty(size, 'height')
                ? readFiniteNumber(size.height, 'payload.layout.shape.size.height')
                : baseShape.size?.mode === 'fixed'
                  ? baseShape.size.height
                  : 260,
              padding: nextPadding,
            }
          : {
              mode: 'fit-content',
              padding: nextPadding,
            },
      shapeTextMode: hasOwnProperty(shape, 'shapeTextMode')
        ? shape.shapeTextMode === 'per-character'
          ? 'per-character'
          : 'whole-text'
        : baseShape.shapeTextMode,
      maskScale: hasOwnProperty(shape, 'maskScale')
        ? shape.maskScale === undefined
          ? undefined
          : readFiniteNumber(shape.maskScale, 'payload.layout.shape.maskScale')
        : baseShape.maskScale,
      alphaThreshold: hasOwnProperty(shape, 'alphaThreshold')
        ? shape.alphaThreshold === undefined
          ? undefined
          : readFiniteNumber(shape.alphaThreshold, 'payload.layout.shape.alphaThreshold', true)
        : baseShape.alphaThreshold,
    }

    return
  }

  const baseShape =
    target.layout.shape.kind === 'polygon'
      ? target.layout.shape
      : createDefaultGeometryShape('digit-two')

  if (!hasOwnProperty(shape, 'points')) {
    target.layout.shape = baseShape
    return
  }

  const points = Array.isArray(shape.points) ? shape.points : null
  if (points === null || points.length < 3) {
    throw new Error('payload.layout.shape.points must contain at least 3 points')
  }

  target.layout.shape = {
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
