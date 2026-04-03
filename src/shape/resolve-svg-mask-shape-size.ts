import type { SvgMaskShape, SvgMaskShapeViewBox } from '../types.js'

export type ResolvedSvgMaskShapeSize = {
  mode: 'fit-content' | 'fixed'
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

export function resolveSvgMaskViewBox(viewBox: SvgMaskShapeViewBox): Required<SvgMaskShapeViewBox> {
  return {
    x: viewBox.x === undefined ? 0 : assertFiniteNumber(viewBox.x, 'svg-mask viewBox.x'),
    y: viewBox.y === undefined ? 0 : assertFiniteNumber(viewBox.y, 'svg-mask viewBox.y'),
    width: assertPositiveFiniteNumber(viewBox.width, 'svg-mask viewBox.width'),
    height: assertPositiveFiniteNumber(viewBox.height, 'svg-mask viewBox.height'),
  }
}

export function resolveSvgMaskShapeSize(shape: SvgMaskShape): ResolvedSvgMaskShapeSize {
  if (shape.size !== undefined && (shape.size === null || typeof shape.size !== 'object')) {
    throw new Error('svg-mask size must be an object')
  }

  const viewBox = resolveSvgMaskViewBox(shape.viewBox)
  const size = shape.size ?? {}
  const mode = size.mode ?? 'fit-content'
  if (mode !== 'fit-content' && mode !== 'fixed') {
    throw new Error('svg-mask size.mode must be fit-content or fixed')
  }

  const padding = size.padding === undefined ? 0 : assertFiniteNumber(size.padding, 'svg-mask padding')
  if (padding < 0) {
    throw new Error('svg-mask padding must be a finite non-negative number')
  }

  if (mode === 'fixed') {
    const fixedSize = size as { width: number; height: number }

    return {
      mode,
      width: assertPositiveFiniteNumber(fixedSize.width, 'svg-mask fixed width'),
      height: assertPositiveFiniteNumber(fixedSize.height, 'svg-mask fixed height'),
      padding,
    }
  }

  return {
    mode,
    width: Math.max(1, viewBox.width + padding * 2),
    height: Math.max(1, viewBox.height + padding * 2),
    padding,
  }
}
