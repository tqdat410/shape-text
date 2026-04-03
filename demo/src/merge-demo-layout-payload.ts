import type { DemoRequest } from './demo-model'

import { mergeDemoShapePayload } from './merge-demo-shape-payload'
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
  target.layout.shape = mergeDemoShapePayload(target.layout.shape, shape)
}
