import type { BrowserCanvas2DContext } from '../text/create-browser-canvas-2d-context.js'
import type { TextMaskShape, TextMaskShapeSizeMode } from '../types.js'

type TextMaskShapeWithLegacySizeFields = TextMaskShape & {
  width?: unknown
  height?: unknown
  padding?: unknown
}

export type TextMaskContentMetrics = {
  left: number
  right: number
  ascent: number
  descent: number
  width: number
  height: number
}

export type ResolvedTextMaskSize = {
  mode: TextMaskShapeSizeMode
  width: number
  height: number
  padding: number
}

function assertFiniteNumber(value: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`)
  }

  return value
}

function assertPositiveFiniteNumber(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a finite positive number`)
  }

  return value
}

function assertNoLegacySizeFields(shape: TextMaskShapeWithLegacySizeFields): void {
  if ('width' in shape || 'height' in shape || 'padding' in shape) {
    throw new Error('text-mask width, height, and padding moved to shape.size')
  }
}

function resolveMetric(value: number | undefined, fallback = 0): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback
}

export function measureTextMaskContent(
  context: BrowserCanvas2DContext,
  shape: TextMaskShape,
  text = shape.text,
): TextMaskContentMetrics {
  context.font = shape.font
  const metrics = context.measureText(text)
  const left = resolveMetric(metrics.actualBoundingBoxLeft, 0)
  const right = resolveMetric(metrics.actualBoundingBoxRight, metrics.width)
  const ascent = resolveMetric(metrics.actualBoundingBoxAscent, 0)
  const descent = resolveMetric(metrics.actualBoundingBoxDescent, 0)

  return {
    left,
    right,
    ascent,
    descent,
    width: left + right,
    height: ascent + descent,
  }
}

export function resolveTextMaskShapeSize(
  shape: TextMaskShape,
  contentMetrics: TextMaskContentMetrics,
): ResolvedTextMaskSize {
  assertNoLegacySizeFields(shape as TextMaskShapeWithLegacySizeFields)

  if (shape.size !== undefined && (shape.size === null || typeof shape.size !== 'object')) {
    throw new Error('text-mask size must be an object')
  }

  const size = shape.size ?? {}
  const mode = size.mode ?? 'fit-content'
  if (mode !== 'fit-content' && mode !== 'fixed') {
    throw new Error('text-mask size.mode must be fit-content or fixed')
  }

  const padding = size.padding === undefined ? 0 : assertFiniteNumber(size.padding, 'text-mask padding')
  if (padding < 0) {
    throw new Error('text-mask padding must be a finite non-negative number')
  }

  if (mode === 'fixed') {
    const fixedSize = size as { width: number; height: number }

    return {
      mode,
      width: assertPositiveFiniteNumber(fixedSize.width, 'text-mask fixed width'),
      height: assertPositiveFiniteNumber(fixedSize.height, 'text-mask fixed height'),
      padding,
    }
  }

  return {
    mode,
    width: Math.max(1, contentMetrics.width + padding * 2),
    height: Math.max(1, contentMetrics.height + padding * 2),
    padding,
  }
}
