import type { CompiledShapeBands } from '../types.js'
import { compileShapeForLayout } from '../shape/compile-shape-for-layout.js'

const MAX_FILL_BASE_MIN_SLOT_WIDTH_FACTOR = 0.45
const MIN_MAX_FILL_SLOT_WIDTH = 6

export function resolveMaxFillMinSlotWidth(lineHeight: number): number {
  return Math.max(MIN_MAX_FILL_SLOT_WIDTH, Math.round(lineHeight * MAX_FILL_BASE_MIN_SLOT_WIDTH_FACTOR))
}

export function ensureMaxFillCompiledShape(compiledShape: CompiledShapeBands): CompiledShapeBands {
  const recommendedMinSlotWidth = resolveMaxFillMinSlotWidth(compiledShape.bandHeight)
  if (compiledShape.minSlotWidth <= recommendedMinSlotWidth) {
    return compiledShape
  }

  return compileShapeForLayout({
    shape: compiledShape.source,
    lineHeight: compiledShape.bandHeight,
    minSlotWidth: recommendedMinSlotWidth,
  })
}
