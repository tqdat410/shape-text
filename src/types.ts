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

export type TextMaskShape = {
  kind: 'text-mask'
  text: string
  font: string
  width: number
  height: number
  padding?: number
  maskScale?: number
  alphaThreshold?: number
}

export type ShapeInput = PolygonShape | TextMaskShape

export type TextMeasurer = {
  measureText(text: string, font: string): number
}

export type TextStyleInput = {
  family: string
  size: number
  weight?: number | string
  style?: 'normal' | 'italic' | 'oblique'
  color?: string
}

export type ResolvedTextStyle = {
  font: string
  family?: string
  size?: number
  weight?: number | string
  style?: 'normal' | 'italic' | 'oblique'
  color?: string
}

export type ShapeShadowInput = {
  color?: string
  blur: number
  offsetX?: number
  offsetY?: number
}

export type ResolvedShapeShadow = {
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export type ShapeStyleInput = {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  shadow?: ShapeShadowInput
}

export type ResolvedShapeStyle = {
  backgroundColor?: string
  borderColor: string
  borderWidth: number
  shadow?: ResolvedShapeShadow
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

export type CompiledShapeBand = {
  top: number
  bottom: number
  intervals: Interval[]
}

export type CompiledShapeDebugView =
  | {
      kind: 'polygon'
      points: ShapeTextPoint[]
    }
  | {
      kind: 'text'
      text: string
      font: string
      x: number
      baseline: number
    }

export type CompiledShapeBands = {
  kind: ShapeInput['kind']
  source: ShapeInput
  bounds: ShapeBounds
  bandHeight: number
  minSlotWidth: number
  bands: CompiledShapeBand[]
  debugView: CompiledShapeDebugView
}

export type ShapeTextLayout = {
  font: string
  textStyle?: ResolvedTextStyle
  lineHeight: number
  shape: ShapeInput
  compiledShape: CompiledShapeBands
  bounds: ShapeBounds
  lines: ShapeTextLine[]
  exhausted: boolean
  autoFill: boolean
}

export type CompileShapeForLayoutOptions = {
  shape: ShapeInput
  lineHeight: number
  minSlotWidth?: number
}

export type LayoutTextInCompiledShapeOptions = {
  text: string
  compiledShape: CompiledShapeBands
  measurer: TextMeasurer
  align?: 'left' | 'center'
  baselineRatio?: number
  autoFill?: boolean
} & (
  | {
      font: string
      textStyle?: TextStyleInput
    }
  | {
      font?: string
      textStyle: TextStyleInput
    }
)

export type LayoutTextInShapeOptions = {
  text: string
  lineHeight: number
  shape: ShapeInput
  measurer: TextMeasurer
  align?: 'left' | 'center'
  minSlotWidth?: number
  baselineRatio?: number
  autoFill?: boolean
} & (
  | {
      font: string
      textStyle?: TextStyleInput
    }
  | {
      font?: string
      textStyle: TextStyleInput
    }
)

export type RenderLayoutToSvgOptions = {
  padding?: number
  background?: string
  textFill?: string
  shapeStroke?: string
  shapeFill?: string
  shapeStyle?: ShapeStyleInput
  showShape?: boolean
}
