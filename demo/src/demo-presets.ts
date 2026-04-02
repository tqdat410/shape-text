import type { PolygonShape } from 'shape-text'

export type GeometryPresetId = 'custom' | 'digit-two' | 'rectangle-wide'
export type FillPresetId =
  | 'custom'
  | 'ascii-random'
  | 'binary-random'
  | 'hex-random'
  | 'octal-random'
  | 'symbol-random'

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

function getRandomUint32Values(length: number) {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    return globalThis.crypto.getRandomValues(new Uint32Array(length))
  }

  const values = new Uint32Array(length)
  for (let index = 0; index < length; index++) {
    values[index] = Math.floor(Math.random() * 0x100000000)
  }

  return values
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
  {
    id: 'ascii-random',
    label: 'ASCII',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>?/|+-=',
    length: 96,
  },
  { id: 'binary-random', label: 'BINARY', alphabet: '01', length: 128 },
  { id: 'hex-random', label: 'HEX', alphabet: '0123456789ABCDEF', length: 112 },
  { id: 'octal-random', label: 'OCTAL', alphabet: '01234567', length: 120 },
  { id: 'symbol-random', label: 'SYMBOL', alphabet: '<>[]{}()/\\|+-=_*#@~', length: 96 },
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
  const preset = fillTextPresets.find(candidate => candidate.id === id) ?? fillTextPresets[0]
  if (preset.id === 'custom') {
    return null
  }

  const values = getRandomUint32Values(preset.length)
  let text = ''

  for (let index = 0; index < preset.length; index++) {
    text += preset.alphabet[values[index]! % preset.alphabet.length]!
  }

  return text
}
