import type { ResolvedTextStyle, TextStyleInput } from '../types.js'

function assertFinitePositiveSize(size: number): void {
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('textStyle.size must be a finite positive number')
  }
}

export function normalizeTextStyleToFont(textStyle: TextStyleInput): ResolvedTextStyle {
  if (textStyle.family.trim().length === 0) {
    throw new Error('textStyle.family must be a non-empty string')
  }

  assertFinitePositiveSize(textStyle.size)

  return {
    family: textStyle.family,
    size: textStyle.size,
    weight: textStyle.weight ?? 400,
    style: textStyle.style ?? 'normal',
    color: textStyle.color,
    font: `${textStyle.style ?? 'normal'} ${String(textStyle.weight ?? 400)} ${textStyle.size}px ${textStyle.family}`,
  }
}

export function resolveLayoutTextStyle(options: {
  font?: string
  textStyle?: TextStyleInput
}): ResolvedTextStyle {
  if (options.textStyle !== undefined) {
    return normalizeTextStyleToFont(options.textStyle)
  }

  if (options.font !== undefined && options.font.trim().length > 0) {
    return {
      font: options.font,
    }
  }

  throw new Error('layout text requires either font or textStyle')
}
