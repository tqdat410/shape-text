import type { LayoutTextInShapeOptions, ShapeTextLayout } from '../types.js'
import { compileShapeForLayout } from '../shape/compile-shape-for-layout.js'
import { layoutTextInCompiledShape } from './layout-text-in-compiled-shape.js'

export function layoutTextInShape(options: LayoutTextInShapeOptions): ShapeTextLayout {
  const compiledShape = compileShapeForLayout({
    shape: options.shape,
    lineHeight: options.lineHeight,
    minSlotWidth: options.minSlotWidth,
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
  })
}
