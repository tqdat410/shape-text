import type { LayoutTextInCompiledShapeOptions, ShapeTextLayout } from '../types.js'
import { resolveFlowLayout } from './resolve-flow-layout.js'
import { resolveMaxFillLayout } from './resolve-max-fill-layout.js'
import {
  hasSequentialShapeRegions,
  resolveSequentialShapeRegions,
} from './resolve-sequential-shape-regions.js'

export function layoutTextInCompiledShape(
  options: LayoutTextInCompiledShapeOptions,
): ShapeTextLayout {
  if (hasSequentialShapeRegions(options.compiledShape)) {
    return resolveSequentialShapeRegions(options)
  }

  if (options.autoFill === true) {
    return resolveMaxFillLayout(options)
  }

  return resolveFlowLayout(options)
}
