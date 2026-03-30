export type ShapeTextPoint = {
  x: number
  y: number
}

export type Interval = {
  left: number
  right: number
}

export type PolygonShape = {
  kind: 'polygon'
  points: ShapeTextPoint[]
}

export type TextMeasurer = {
  measureText(text: string, font: string): number
}

export type PreparedLayoutToken = {
  kind: 'word' | 'newline'
  text: string
  width: number
  graphemes: string[]
  graphemePrefixWidths: number[]
}

export type PreparedLayoutText = {
  font: string
  spaceWidth: number
  tokens: PreparedLayoutToken[]
}

export type LayoutCursor = {
  tokenIndex: number
  graphemeIndex: number
}

export type LayoutLineRange = {
  text: string
  width: number
  start: LayoutCursor
  end: LayoutCursor
}

export type ShapeTextLine = LayoutLineRange & {
  x: number
  top: number
  baseline: number
  slot: Interval
}

export type ShapeBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

export type ShapeTextLayout = {
  font: string
  lineHeight: number
  shape: PolygonShape
  bounds: ShapeBounds
  lines: ShapeTextLine[]
  exhausted: boolean
}

export type LayoutTextInShapeOptions = {
  text: string
  font: string
  lineHeight: number
  shape: PolygonShape
  measurer: TextMeasurer
  align?: 'left' | 'center'
  minSlotWidth?: number
  baselineRatio?: number
}

export type RenderLayoutToSvgOptions = {
  padding?: number
  background?: string
  textFill?: string
  shapeStroke?: string
  shapeFill?: string
  showShape?: boolean
}

