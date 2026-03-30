export type BrowserCanvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export function createBrowserCanvas2DContext(
  width = 1,
  height = 1,
): BrowserCanvas2DContext {
  const safeWidth = Math.max(1, Math.ceil(width))
  const safeHeight = Math.max(1, Math.ceil(height))

  if (typeof OffscreenCanvas !== 'undefined') {
    const context = new OffscreenCanvas(safeWidth, safeHeight).getContext('2d')
    if (context !== null) {
      return context
    }
  }

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas')
    canvas.width = safeWidth
    canvas.height = safeHeight
    const context = canvas.getContext('2d')
    if (context !== null) {
      return context
    }
  }

  throw new Error('shape-text needs a browser canvas context or a custom TextMeasurer')
}
