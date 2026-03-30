import type { CompiledShapeBands, CompileShapeForLayoutOptions } from '../types.js'
import { compilePolygonShapeForLayout } from './compile-polygon-shape-for-layout.js'
import { compileTextMaskShapeForLayout } from './compile-text-mask-shape-for-layout.js'

export function compileShapeForLayout(
  options: CompileShapeForLayoutOptions,
): CompiledShapeBands {
  if (!Number.isFinite(options.lineHeight) || options.lineHeight <= 0) {
    throw new Error('lineHeight must be a finite positive number')
  }

  const minSlotWidth = options.minSlotWidth ?? Math.max(16, options.lineHeight * 0.8)
  if (!Number.isFinite(minSlotWidth) || minSlotWidth < 0) {
    throw new Error('minSlotWidth must be a finite non-negative number')
  }

  switch (options.shape.kind) {
    case 'polygon':
      return compilePolygonShapeForLayout(options.shape, options.lineHeight, minSlotWidth)

    case 'text-mask':
      return compileTextMaskShapeForLayout(options.shape, options.lineHeight, minSlotWidth)
  }
}
