import type { DemoRequest } from './demo-model'

import { assertObject, hasOwnProperty, readFiniteNumber } from './demo-payload-primitives'

export function mergeDemoRenderPayload(target: DemoRequest, render: Record<string, unknown>) {
  if (hasOwnProperty(render, 'background')) {
    target.render.background = render.background === undefined ? undefined : String(render.background)
  }

  if (hasOwnProperty(render, 'padding')) {
    target.render.padding = readFiniteNumber(render.padding, 'payload.render.padding', true)
  }

  if (hasOwnProperty(render, 'showShape')) {
    target.render.showShape = Boolean(render.showShape)
  }

  if (!hasOwnProperty(render, 'shapeStyle')) {
    return
  }

  const shapeStyle =
    render.shapeStyle === undefined ? {} : assertObject(render.shapeStyle, 'payload.render.shapeStyle')
  const shadow =
    shapeStyle.shadow === undefined || shapeStyle.shadow === null
      ? null
      : assertObject(shapeStyle.shadow, 'payload.render.shapeStyle.shadow')

  target.render.shapeStyle = {
    backgroundColor: hasOwnProperty(shapeStyle, 'backgroundColor')
      ? String(shapeStyle.backgroundColor)
      : target.render.shapeStyle?.backgroundColor,
    borderColor: hasOwnProperty(shapeStyle, 'borderColor')
      ? String(shapeStyle.borderColor)
      : target.render.shapeStyle?.borderColor,
    borderWidth: hasOwnProperty(shapeStyle, 'borderWidth')
      ? readFiniteNumber(shapeStyle.borderWidth, 'payload.render.shapeStyle.borderWidth', true)
      : target.render.shapeStyle?.borderWidth,
    shadow:
      hasOwnProperty(shapeStyle, 'shadow')
        ? shadow === null
          ? undefined
          : {
              color: hasOwnProperty(shadow, 'color')
                ? String(shadow.color)
                : target.render.shapeStyle?.shadow?.color ?? 'rgba(15, 23, 42, 0.22)',
              blur: hasOwnProperty(shadow, 'blur')
                ? readFiniteNumber(shadow.blur, 'payload.render.shapeStyle.shadow.blur', true)
                : target.render.shapeStyle?.shadow?.blur ?? 8,
              offsetX: hasOwnProperty(shadow, 'offsetX')
                ? readFiniteNumber(shadow.offsetX, 'payload.render.shapeStyle.shadow.offsetX', true)
                : target.render.shapeStyle?.shadow?.offsetX ?? 0,
              offsetY: hasOwnProperty(shadow, 'offsetY')
                ? readFiniteNumber(shadow.offsetY, 'payload.render.shapeStyle.shadow.offsetY', true)
                : target.render.shapeStyle?.shadow?.offsetY ?? 8,
            }
        : target.render.shapeStyle?.shadow,
  }
}
