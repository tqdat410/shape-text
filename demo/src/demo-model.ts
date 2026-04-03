import type {
  PolygonShape,
  RenderLayoutToSvgOptions,
  ShapeInput,
  SvgMaskShape,
  TextMaskShape,
  TextStyleInput,
} from 'shape-text'

import {
  createGeometryShapeFromPreset,
  createSvgMaskShapeFromPreset,
  defaultParagraphText,
  type GeometryPresetId,
} from './demo-presets'

export type ShapeSource = 'geometry' | 'value-derived' | 'svg-mask'

export type DemoRequest = {
  layout: {
    text: string
    textStyle: TextStyleInput
    lineHeight: number
    shape: ShapeInput
    minSlotWidth?: number
    autoFill: boolean
  }
  render: RenderLayoutToSvgOptions
}

export function createDefaultTextMaskShape(): TextMaskShape {
  return {
    kind: 'text-mask',
    text: '23',
    font: '700 420px Arial',
    size: {
      mode: 'fit-content',
      padding: 10,
    },
    shapeTextMode: 'whole-text',
    maskScale: 2,
  }
}

export function createDefaultSvgMaskShape(): SvgMaskShape {
  return createSvgMaskShapeFromPreset('speech-bubble')
}

export function createDefaultDemoRequest(): DemoRequest {
  return {
    layout: {
      text: defaultParagraphText,
      textStyle: {
        family: '"Helvetica Neue", Arial, sans-serif',
        size: 18,
        weight: 700,
        style: 'normal',
        color: '#0f172a',
      },
      lineHeight: 24,
      shape: createDefaultTextMaskShape(),
      autoFill: true,
    },
    render: {
      background: '#f8fafc',
      padding: 16,
      showShape: true,
      shapeStyle: {
        backgroundColor: '#dbeafe',
        borderColor: '#94a3b8',
        borderWidth: 2,
        shadow: {
          color: 'rgba(15, 23, 42, 0.22)',
          blur: 8,
          offsetX: 0,
          offsetY: 8,
        },
      },
    },
  }
}

export function cloneDemoRequest(request: DemoRequest): DemoRequest {
  return {
    layout: {
      ...request.layout,
      textStyle: { ...request.layout.textStyle },
      shape: cloneShape(request.layout.shape),
    },
    render: {
      ...request.render,
      shapeStyle:
        request.render.shapeStyle === undefined
          ? undefined
          : {
              ...request.render.shapeStyle,
              shadow:
                request.render.shapeStyle.shadow === undefined
                  ? undefined
                  : { ...request.render.shapeStyle.shadow },
            },
    },
  }
}

export function cloneShape(shape: ShapeInput): ShapeInput {
  if (shape.kind === 'polygon') {
    return {
      kind: 'polygon',
      points: shape.points.map(point => ({ ...point })),
    }
  }

  if (shape.kind === 'svg-mask') {
    return {
      ...shape,
      size: shape.size === undefined ? undefined : { ...shape.size },
      viewBox: { ...shape.viewBox },
    }
  }

  return {
    ...shape,
    size: shape.size === undefined ? undefined : { ...shape.size },
  }
}

export function deriveShapeSource(shape: ShapeInput): ShapeSource {
  if (shape.kind === 'polygon') {
    return 'geometry'
  }

  return shape.kind === 'svg-mask' ? 'svg-mask' : 'value-derived'
}

export function createDefaultGeometryShape(geometryPresetId: GeometryPresetId): PolygonShape {
  return createGeometryShapeFromPreset(geometryPresetId)
}
