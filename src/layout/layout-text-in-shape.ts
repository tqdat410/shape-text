import type { LayoutTextInShapeOptions, ShapeTextLayout } from '../types.js'
import { compileShapeForLayout } from '../shape/compile-shape-for-layout.js'
import { layoutTextInCompiledShape } from './layout-text-in-compiled-shape.js'

function resolveCompileMinSlotWidth(options: LayoutTextInShapeOptions): number | undefined {
  if (options.fillStrategy !== 'max' || options.autoFill !== true) {
    return options.minSlotWidth
  }

  if (options.minSlotWidth !== undefined) {
    return options.minSlotWidth
  }

  return Math.max(6, Math.round(options.lineHeight * 0.45))
}

export function layoutTextInShape(options: LayoutTextInShapeOptions): ShapeTextLayout {
  const compiledShape = compileShapeForLayout({
    shape: options.shape,
    lineHeight: options.lineHeight,
    minSlotWidth: resolveCompileMinSlotWidth(options),
  })

  if (options.textStyle !== undefined) {
    return layoutTextInCompiledShape({
      text: options.text,
      font: options.font,
      textStyle: options.textStyle,
      compiledShape,
      measurer: options.measurer,
      align: options.align,
      baselineRatio: options.baselineRatio,
      autoFill: options.autoFill,
      autoFillMode: options.autoFillMode,
      fillStrategy: options.fillStrategy,
    })
  }

  return layoutTextInCompiledShape({
    text: options.text,
    font: options.font!,
    compiledShape,
    measurer: options.measurer,
    align: options.align,
    baselineRatio: options.baselineRatio,
    autoFill: options.autoFill,
    autoFillMode: options.autoFillMode,
    fillStrategy: options.fillStrategy,
  })
}
