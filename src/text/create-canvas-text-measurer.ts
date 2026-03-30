import type { TextMeasurer } from '../types.js'

type CanvasTextContext = {
  font: string
  measureText(text: string): TextMetrics
}

function createCanvasContext(): CanvasTextContext {
  if (typeof OffscreenCanvas !== 'undefined') {
    const context = new OffscreenCanvas(1, 1).getContext('2d')
    if (context !== null) return context
  }

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context !== null) return context
  }

  throw new Error('shape-text needs a browser canvas context or a custom TextMeasurer')
}

export function createCanvasTextMeasurer(): TextMeasurer {
  const context = createCanvasContext()

  return {
    measureText(text, font) {
      context.font = font
      return context.measureText(text).width
    },
  }
}
