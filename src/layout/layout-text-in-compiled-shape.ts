import type { AutoFillMode, FillStrategy, LayoutTextInCompiledShapeOptions, ShapeTextLayout } from '../types.js'
import { resolveFlowLayout } from './resolve-flow-layout.js'
import { resolveMaxFillLayout } from './resolve-max-fill-layout.js'

export function layoutTextInCompiledShape(
  options: LayoutTextInCompiledShapeOptions,
): ShapeTextLayout {
  const autoFill = options.autoFill ?? false
  const autoFillMode: AutoFillMode = autoFill ? (options.autoFillMode ?? 'words') : 'words'
  const fillStrategy: FillStrategy = autoFill ? (options.fillStrategy ?? 'flow') : 'flow'

  if (fillStrategy === 'max') {
    return resolveMaxFillLayout(options)
  }

  return resolveFlowLayout(options, autoFillMode)
}
