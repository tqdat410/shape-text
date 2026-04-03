import type {
  CompiledShapeDebugView,
  RenderLayoutToSvgOptions,
  ShapeTextLayout,
  ShapeTextPoint,
} from '../types.js'
import { createSvgShadowFilter } from './render-svg-shadow-filter.js'
import { normalizeShapeDecoration } from './normalize-shape-decoration.js'
import { escapeXmlText } from './escape-xml-text.js'

function renderPoints(points: ShapeTextPoint[]): string {
  return points.map(point => `${point.x},${point.y}`).join(' ')
}

function getEffectPadding(options: {
  strokeWidth: number
  shadow?: {
    blur: number
    offsetX: number
    offsetY: number
  }
}) {
  const strokePadding = options.strokeWidth / 2
  const shadowBlurPadding = options.shadow === undefined ? 0 : options.shadow.blur * 3

  return {
    left:
      strokePadding +
      (options.shadow === undefined ? 0 : shadowBlurPadding + Math.max(0, -options.shadow.offsetX)),
    right:
      strokePadding +
      (options.shadow === undefined ? 0 : shadowBlurPadding + Math.max(0, options.shadow.offsetX)),
    top:
      strokePadding +
      (options.shadow === undefined ? 0 : shadowBlurPadding + Math.max(0, -options.shadow.offsetY)),
    bottom:
      strokePadding +
      (options.shadow === undefined ? 0 : shadowBlurPadding + Math.max(0, options.shadow.offsetY)),
  }
}

function renderShapeAttributes(
  debugView: CompiledShapeDebugView,
  options: {
    fill: string
    stroke: string
    strokeWidth: number
    filterUrl?: string
  },
): string {
  const filter = options.filterUrl === undefined ? '' : ` filter="${options.filterUrl}"`
  const fill = escapeXmlText(options.fill)
  const stroke = escapeXmlText(options.stroke)

  if (debugView.kind === 'polygon') {
    return `<polygon points="${renderPoints(debugView.points)}" fill="${fill}" stroke="${stroke}" stroke-width="${options.strokeWidth}"${filter} />`
  }

  if (debugView.kind === 'path') {
    return `<path d="${escapeXmlText(debugView.path)}" transform="translate(${debugView.x} ${debugView.y}) scale(${debugView.scaleX} ${debugView.scaleY})" fill="${fill}" stroke="${stroke}" stroke-width="${options.strokeWidth}"${filter} />`
  }

  return `<text x="${debugView.x}" y="${debugView.baseline}" fill="${fill}" stroke="${stroke}" stroke-width="${options.strokeWidth}"${filter} style="font:${escapeXmlText(debugView.font)};">${escapeXmlText(debugView.text)}</text>`
}

export function renderLayoutToSvg(
  layout: ShapeTextLayout,
  options: RenderLayoutToSvgOptions = {},
): string {
  const userPadding = options.padding ?? 0
  const textFill = options.textFill ?? layout.textStyle?.color ?? '#111827'
  const shapeStyle = normalizeShapeDecoration(options)
  const background = options.background
  const hasVisibleCanonicalShapeDecoration =
    options.shapeStyle !== undefined &&
    (shapeStyle.backgroundColor !== undefined ||
      shapeStyle.borderWidth > 0 ||
      shapeStyle.shadow !== undefined)
  const showShape = options.showShape ?? hasVisibleCanonicalShapeDecoration
  const effectPadding = showShape
    ? getEffectPadding({
        strokeWidth: shapeStyle.borderWidth,
        shadow: shapeStyle.shadow,
      })
    : { left: 0, right: 0, top: 0, bottom: 0 }
  const totalPadding = {
    left: userPadding + effectPadding.left,
    right: userPadding + effectPadding.right,
    top: userPadding + effectPadding.top,
    bottom: userPadding + effectPadding.bottom,
  }
  const width = layout.bounds.right - layout.bounds.left + totalPadding.left + totalPadding.right
  const height = layout.bounds.bottom - layout.bounds.top + totalPadding.top + totalPadding.bottom
  const viewBoxLeft = layout.bounds.left - totalPadding.left
  const viewBoxTop = layout.bounds.top - totalPadding.top
  const shadowFilter =
    showShape && shapeStyle.shadow !== undefined
      ? createSvgShadowFilter(shapeStyle.shadow, {
          x: viewBoxLeft,
          y: viewBoxTop,
          width,
          height,
        })
      : undefined

  const pieces = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxLeft} ${viewBoxTop} ${width} ${height}" width="${width}" height="${height}">`,
  ]

  if (shadowFilter !== undefined) {
    pieces.push(shadowFilter.markup)
  }

  if (background !== undefined) {
    pieces.push(
      `<rect x="${viewBoxLeft}" y="${viewBoxTop}" width="${width}" height="${height}" fill="${escapeXmlText(background)}" />`,
    )
  }

  if (showShape) {
    pieces.push(
      renderShapeAttributes(layout.compiledShape.debugView, {
        fill: shapeStyle.backgroundColor ?? 'none',
        stroke: shapeStyle.borderColor,
        strokeWidth: shapeStyle.borderWidth,
        filterUrl: shadowFilter === undefined ? undefined : `url(#${shadowFilter.filterId})`,
      }),
    )
  }

  for (let index = 0; index < layout.lines.length; index++) {
    const line = layout.lines[index]!
    pieces.push(
      `<text x="${line.x}" y="${line.baseline}" fill="${escapeXmlText(textFill)}" style="font:${escapeXmlText(line.font ?? layout.font)};">${escapeXmlText(line.text)}</text>`,
    )
  }

  pieces.push('</svg>')
  return pieces.join('')
}
