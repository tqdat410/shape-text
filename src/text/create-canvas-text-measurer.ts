import type { TextMeasurer } from '../types.js'
import { createBrowserCanvas2DContext } from './create-browser-canvas-2d-context.js'

export function createCanvasTextMeasurer(): TextMeasurer {
  const context = createBrowserCanvas2DContext()

  return {
    measureText(text, font) {
      context.font = font
      return context.measureText(text).width
    },
  }
}
