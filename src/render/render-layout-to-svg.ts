import type {
  CompiledShapeDebugView,
  RenderLayoutToSvgOptions,
  ShapeTextLayout,
  ShapeTextPoint,
} from '../types.js'
import { escapeXmlText } from './escape-xml-text.js'

function renderPoints(points: ShapeTextPoint[]): string {
  return points.map(point => `${point.x},${point.y}`).join(' ')
}

function renderDebugShape(
  debugView: CompiledShapeDebugView,
  shapeFill: string,
  shapeStroke: string,
): string {
  if (debugView.kind === 'polygon') {
    return `<polygon points="${renderPoints(debugView.points)}" fill="${shapeFill}" stroke="${shapeStroke}" stroke-width="1" />`
  }

  return `<text x="${debugView.x}" y="${debugView.baseline}" fill="${shapeFill}" stroke="${shapeStroke}" stroke-width="1" style="font:${escapeXmlText(debugView.font)};">${escapeXmlText(debugView.text)}</text>`
}

export function renderLayoutToSvg(
  layout: ShapeTextLayout,
  options: RenderLayoutToSvgOptions = {},
): string {
  const padding = options.padding ?? 0
  const width = layout.bounds.right - layout.bounds.left + padding * 2
  const height = layout.bounds.bottom - layout.bounds.top + padding * 2
  const viewBoxLeft = layout.bounds.left - padding
  const viewBoxTop = layout.bounds.top - padding
  const textFill = options.textFill ?? '#111827'
  const shapeStroke = options.shapeStroke ?? '#d1d5db'
  const shapeFill = options.shapeFill ?? 'none'
  const background = options.background
  const showShape = options.showShape ?? false

  const pieces = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxLeft} ${viewBoxTop} ${width} ${height}" width="${width}" height="${height}">`,
  ]

  if (background !== undefined) {
    pieces.push(`<rect x="${viewBoxLeft}" y="${viewBoxTop}" width="${width}" height="${height}" fill="${background}" />`)
  }

  if (showShape) {
    pieces.push(renderDebugShape(layout.compiledShape.debugView, shapeFill, shapeStroke))
  }

  for (let index = 0; index < layout.lines.length; index++) {
    const line = layout.lines[index]!
    pieces.push(
      `<text x="${line.x}" y="${line.baseline}" fill="${textFill}" style="font:${escapeXmlText(layout.font)};">${escapeXmlText(line.text)}</text>`,
    )
  }

  pieces.push('</svg>')
  return pieces.join('')
}
