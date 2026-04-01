import type {
  RenderLayoutToSvgOptions,
  ResolvedShapeStyle,
  ShapeShadowInput,
} from '../types.js'

function assertFiniteNonNegative(value: number, message: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(message)
  }
}

function normalizeShadow(shadow: ShapeShadowInput | undefined): ResolvedShapeStyle['shadow'] {
  if (shadow === undefined) {
    return undefined
  }

  assertFiniteNonNegative(shadow.blur, 'shapeStyle.shadow.blur must be a finite non-negative number')

  const offsetX = shadow.offsetX ?? 0
  const offsetY = shadow.offsetY ?? 0
  if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
    throw new Error('shapeStyle.shadow offsets must be finite numbers')
  }

  return {
    color: shadow.color ?? 'rgba(15, 23, 42, 0.24)',
    blur: shadow.blur,
    offsetX,
    offsetY,
  }
}

export function normalizeShapeDecoration(
  options: RenderLayoutToSvgOptions,
): ResolvedShapeStyle {
  const explicitBorderWidth = options.shapeStyle?.borderWidth
  if (explicitBorderWidth !== undefined) {
    assertFiniteNonNegative(
      explicitBorderWidth,
      'shapeStyle.borderWidth must be a finite non-negative number',
    )
  }

  const borderWidth =
    explicitBorderWidth ??
    (options.shapeStyle?.borderColor !== undefined
      ? 1
      : options.shapeStyle === undefined && (options.shapeStroke !== undefined || options.showShape === true)
        ? 1
        : 0)

  return {
    backgroundColor: options.shapeStyle?.backgroundColor ?? options.shapeFill,
    borderColor: options.shapeStyle?.borderColor ?? options.shapeStroke ?? '#d1d5db',
    borderWidth,
    shadow: normalizeShadow(options.shapeStyle?.shadow),
  }
}
