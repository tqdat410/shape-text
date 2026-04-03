import {
  createRandomFillText,
  randomFillPresets,
  type PolygonShape,
  type RandomFillPresetId,
  type SvgMaskShape,
} from 'shape-text'

export type GeometryPresetId = 'custom' | 'digit-two' | 'rectangle-wide'
export type SvgMaskPresetId = 'custom' | 'speech-bubble' | 'drop'
export type FillPresetId = 'custom' | RandomFillPresetId

export const defaultParagraphText = [
  'shape-text lays out a paragraph inside a custom silhouette, then renders the result as SVG.',
  'Try polygon geometry when you already have points, text-mask when the shape should come from text, or svg-mask when you already have an authored path.',
  'The same layout engine can stay readable like a paragraph or switch to max-fill coverage for decorative text art.',
].join(' ')

function createDigitTwoPolygon(width: number, height: number) {
  return [
    { x: width * 0.12, y: height * 0.1 },
    { x: width * 0.34, y: 0 },
    { x: width * 0.72, y: height * 0.02 },
    { x: width * 0.9, y: height * 0.16 },
    { x: width * 0.88, y: height * 0.32 },
    { x: width * 0.74, y: height * 0.44 },
    { x: width * 0.5, y: height * 0.57 },
    { x: width * 0.26, y: height * 0.72 },
    { x: width * 0.14, y: height * 0.86 },
    { x: width * 0.88, y: height * 0.86 },
    { x: width * 0.86, y: height },
    { x: 0, y: height },
    { x: 0, y: height * 0.78 },
    { x: width * 0.12, y: height * 0.64 },
    { x: width * 0.35, y: height * 0.5 },
    { x: width * 0.62, y: height * 0.35 },
    { x: width * 0.74, y: height * 0.26 },
    { x: width * 0.72, y: height * 0.14 },
    { x: width * 0.58, y: height * 0.08 },
    { x: width * 0.34, y: height * 0.08 },
  ]
}

export const geometryPresets = [
  {
    id: 'digit-two',
    label: 'Digit two polygon',
    createShape: (): PolygonShape => ({
      kind: 'polygon',
      points: createDigitTwoPolygon(340, 460),
    }),
  },
  {
    id: 'rectangle-wide',
    label: 'Wide rectangle',
    createShape: (): PolygonShape => ({
      kind: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: 360, y: 0 },
        { x: 360, y: 320 },
        { x: 0, y: 320 },
      ],
    }),
  },
] as const satisfies ReadonlyArray<{
  id: GeometryPresetId
  label: string
  createShape: () => PolygonShape
}>

export const svgMaskPresets = [
  {
    id: 'speech-bubble',
    label: 'Speech bubble',
    createShape: (): SvgMaskShape => ({
      kind: 'svg-mask',
      path: 'M24 12 C14 12 6 20 6 30 V52 C6 64 15 72 27 72 H48 L64 88 L60 72 H114 C126 72 134 64 134 52 V30 C134 20 126 12 114 12 Z',
      viewBox: { width: 140, height: 88 },
      size: { mode: 'fit-content', padding: 6 },
      maskScale: 2,
    }),
  },
  {
    id: 'drop',
    label: 'Drop silhouette',
    createShape: (): SvgMaskShape => ({
      kind: 'svg-mask',
      path: 'M70 6 C92 6 110 24 110 46 C110 75 86 98 70 122 C54 98 30 75 30 46 C30 24 48 6 70 6 Z',
      viewBox: { width: 140, height: 128 },
      size: { mode: 'fit-content', padding: 6 },
      maskScale: 2,
    }),
  },
] as const satisfies ReadonlyArray<{
  id: Exclude<SvgMaskPresetId, 'custom'>
  label: string
  createShape: () => SvgMaskShape
}>

export const fillTextPresets = [
  { id: 'custom', label: 'Custom' },
  ...randomFillPresets,
] as const

function serializePoints(points: PolygonShape['points']) {
  return points.map(point => `${point.x},${point.y}`).join(';')
}

function serializeSvgMask(shape: SvgMaskShape) {
  const viewBoxX = shape.viewBox.x ?? 0
  const viewBoxY = shape.viewBox.y ?? 0
  return `${shape.path}::${viewBoxX},${viewBoxY},${shape.viewBox.width},${shape.viewBox.height}`
}

export function createGeometryShapeFromPreset(id: GeometryPresetId): PolygonShape {
  return (geometryPresets.find(preset => preset.id === id) ?? geometryPresets[0]).createShape()
}

export function identifyGeometryPresetId(shape: PolygonShape): GeometryPresetId {
  const serializedPoints = serializePoints(shape.points)
  return geometryPresets.find(preset => serializePoints(preset.createShape().points) === serializedPoints)?.id ?? 'custom'
}

export function createSvgMaskShapeFromPreset(id: Exclude<SvgMaskPresetId, 'custom'>): SvgMaskShape {
  return (svgMaskPresets.find(preset => preset.id === id) ?? svgMaskPresets[0]).createShape()
}

export function identifySvgMaskPresetId(shape: SvgMaskShape): SvgMaskPresetId {
  const serializedShape = serializeSvgMask(shape)
  return svgMaskPresets.find(preset => serializeSvgMask(preset.createShape()) === serializedShape)?.id ?? 'custom'
}

export function createFillTextPresetText(id: FillPresetId): string | null {
  if (id === 'custom') {
    return null
  }

  return createRandomFillText({ preset: id })
}
