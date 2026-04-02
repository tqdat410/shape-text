import {
  createRandomFillText,
  randomFillPresets,
  type PolygonShape,
  type RandomFillPresetId,
} from 'shape-text'

export type GeometryPresetId = 'custom' | 'digit-two' | 'rectangle-wide'
export type FillPresetId = 'custom' | RandomFillPresetId

export const defaultParagraphText = [
  'Shape paragraph lets a paragraph travel inside a silhouette instead of wrapping around a float.',
  'Use geometry input when the shape already exists, or value-derived input when the shape should come from text like 23.',
  'The same layout engine then turns that source into SVG lines or max-fill decorative coverage.',
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

export const fillTextPresets = [
  { id: 'custom', label: 'Custom' },
  ...randomFillPresets,
] as const

function serializePoints(points: PolygonShape['points']) {
  return points.map(point => `${point.x},${point.y}`).join(';')
}

export function createGeometryShapeFromPreset(id: GeometryPresetId): PolygonShape {
  return (geometryPresets.find(preset => preset.id === id) ?? geometryPresets[0]).createShape()
}

export function identifyGeometryPresetId(shape: PolygonShape): GeometryPresetId {
  const serializedPoints = serializePoints(shape.points)
  return geometryPresets.find(preset => serializePoints(preset.createShape().points) === serializedPoints)?.id ?? 'custom'
}

export function createFillTextPresetText(id: FillPresetId): string | null {
  if (id === 'custom') {
    return null
  }

  return createRandomFillText({ preset: id })
}
