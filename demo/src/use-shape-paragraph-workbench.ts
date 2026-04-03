import { useRef, useState } from 'react'

import {
  cloneDemoRequest,
  createDefaultDemoRequest,
  createDefaultGeometryShape,
  createDefaultSvgMaskShape,
  createDefaultTextMaskShape,
  deriveShapeSource,
  type DemoRequest,
  type ShapeSource,
} from './demo-model'
import {
  createSvgMaskShapeFromPreset,
  identifyGeometryPresetId,
  identifySvgMaskPresetId,
  createFillTextPresetText,
  type FillPresetId,
  type GeometryPresetId,
  type SvgMaskPresetId,
} from './demo-presets'

export function useShapeParagraphWorkbench() {
  const [request, setRequest] = useState(createDefaultDemoRequest)
  const [fillPresetId, setFillPresetId] = useState<FillPresetId>('custom')
  const [geometryPresetId, setGeometryPresetId] = useState<GeometryPresetId>('digit-two')
  const [svgMaskPresetId, setSvgMaskPresetId] = useState<SvgMaskPresetId>('speech-bubble')
  const polygonShapeRef = useRef(createDefaultGeometryShape('digit-two'))
  const textMaskShapeRef = useRef(createDefaultTextMaskShape())
  const svgMaskShapeRef = useRef(createDefaultSvgMaskShape())
  function syncWorkbenchState(nextRequest: DemoRequest, nextFillPresetId: FillPresetId = fillPresetId) {
    setRequest(nextRequest)
    setFillPresetId(nextFillPresetId)
    if (nextRequest.layout.shape.kind === 'polygon') {
      polygonShapeRef.current = nextRequest.layout.shape
      setGeometryPresetId(identifyGeometryPresetId(nextRequest.layout.shape))
      return
    }
    if (nextRequest.layout.shape.kind === 'text-mask') return void (textMaskShapeRef.current = nextRequest.layout.shape)
    if (nextRequest.layout.shape.kind === 'svg-mask') {
      svgMaskShapeRef.current = nextRequest.layout.shape
      setSvgMaskPresetId(identifySvgMaskPresetId(nextRequest.layout.shape))
    }
  }

  function applyRequest(nextRequest: DemoRequest) {
    syncWorkbenchState(nextRequest, 'custom')
  }
  function updateRequest(update: (current: DemoRequest) => DemoRequest, nextFillPresetId: FillPresetId = fillPresetId) {
    syncWorkbenchState(update(cloneDemoRequest(request)), nextFillPresetId)
  }

  return {
    request,
    fillPresetId,
    geometryPresetId,
    svgMaskPresetId,
    shapeSource: deriveShapeSource(request.layout.shape) as ShapeSource,
    applyRequest,
    setText(text: string) {
      updateRequest(current => ({ ...current, layout: { ...current.layout, text } }), 'custom')
    },
    setFillPreset(id: FillPresetId) {
      const nextText = createFillTextPresetText(id)
      if (nextText === null) {
        setFillPresetId('custom')
        return
      }
      updateRequest(current => ({ ...current, layout: { ...current.layout, text: nextText } }), id)
    },
    rerollFillPreset() {
      if (fillPresetId === 'custom') {
        return
      }
      const nextText = createFillTextPresetText(fillPresetId)
      if (nextText === null) {
        return
      }
      updateRequest(current => ({ ...current, layout: { ...current.layout, text: nextText } }), fillPresetId)
    },
    setShapeSource(source: ShapeSource) {
      updateRequest(current => ({
        ...current,
        layout: {
          ...current.layout,
          shape:
            source === 'geometry'
              ? polygonShapeRef.current
              : source === 'svg-mask'
                ? svgMaskShapeRef.current
                : textMaskShapeRef.current,
        },
      }))
    },
    setGeometryPreset(id: GeometryPresetId) {
      if (id === 'custom') {
        setGeometryPresetId('custom')
        return
      }
      const nextShape = createDefaultGeometryShape(id)
      polygonShapeRef.current = nextShape
      setGeometryPresetId(id)
      if (request.layout.shape.kind === 'polygon') updateRequest(current => ({ ...current, layout: { ...current.layout, shape: nextShape } }))
    },
    setSvgMaskPreset(id: SvgMaskPresetId) {
      if (id === 'custom') {
        setSvgMaskPresetId('custom')
        return
      }
      const nextShape = createSvgMaskShapeFromPreset(id)
      svgMaskShapeRef.current = nextShape
      setSvgMaskPresetId(id)
      if (request.layout.shape.kind === 'svg-mask') updateRequest(current => ({ ...current, layout: { ...current.layout, shape: nextShape } }))
    },
    setTextSize(size: number) {
      updateRequest(current => ({ ...current, layout: { ...current.layout, textStyle: { ...current.layout.textStyle, size } } }))
    },
    setLineHeight(lineHeight: number) {
      updateRequest(current => ({ ...current, layout: { ...current.layout, lineHeight } }))
    },
    setTextWeight(weight: string) {
      updateRequest(current => ({ ...current, layout: { ...current.layout, textStyle: { ...current.layout.textStyle, weight } } }))
    },
    setTextItalic(textItalic: boolean) {
      updateRequest(current => ({
        ...current,
        layout: { ...current.layout, textStyle: { ...current.layout.textStyle, style: textItalic ? 'italic' : 'normal' } },
      }))
    },
    setTextColor(color: string) {
      updateRequest(current => ({ ...current, layout: { ...current.layout, textStyle: { ...current.layout.textStyle, color } } }))
    },
    setAutoFill(autoFill: boolean) {
      updateRequest(current => ({ ...current, layout: { ...current.layout, autoFill } }))
    },
    setShapeText(text: string) {
      if (request.layout.shape.kind !== 'text-mask') return
      updateRequest(current => ({ ...current, layout: { ...current.layout, shape: { ...current.layout.shape, text } } }))
    },
    setShapeTextMode(mode: 'whole-text' | 'per-character') {
      if (request.layout.shape.kind !== 'text-mask') return
      updateRequest(current => ({ ...current, layout: { ...current.layout, shape: { ...current.layout.shape, shapeTextMode: mode } } }))
    },
    setShapeSizeMode(mode: 'fit-content' | 'fixed') {
      if (request.layout.shape.kind !== 'text-mask') return
      updateRequest(current => ({
        ...current,
        layout: {
          ...current.layout,
          shape:
            mode === 'fixed'
              ? { ...current.layout.shape, size: { mode: 'fixed', width: 520, height: 260, padding: 10 } }
              : { ...current.layout.shape, size: { mode: 'fit-content', padding: 10 } },
        },
      }))
    },
    setShapeFixedDimension(dimension: 'width' | 'height', value: number) {
      if (request.layout.shape.kind !== 'text-mask' || request.layout.shape.size?.mode !== 'fixed') return
      updateRequest(current => {
        if (current.layout.shape.kind !== 'text-mask' || current.layout.shape.size?.mode !== 'fixed') return current
        return {
          ...current,
          layout: {
            ...current.layout,
            shape: { ...current.layout.shape, size: { ...current.layout.shape.size, [dimension]: value } },
          },
        }
      })
    },
    setShowShape(showShape: boolean) {
      updateRequest(current => ({ ...current, render: { ...current.render, showShape } }))
    },
    setShapeFill(backgroundColor: string) {
      updateRequest(current => ({
        ...current,
        render: {
          ...current.render,
          shapeStyle: { ...current.render.shapeStyle, backgroundColor },
        },
      }))
    },
  }
}
