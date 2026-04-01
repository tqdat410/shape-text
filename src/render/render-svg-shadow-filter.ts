import type { ResolvedShapeShadow } from '../types.js'
import { escapeXmlText } from './escape-xml-text.js'

function hashString(value: string): string {
  let hash = 0

  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}

export function createSvgShadowFilter(
  shadow: ResolvedShapeShadow,
  filterRegion: {
    x: number
    y: number
    width: number
    height: number
  },
): {
  filterId: string
  markup: string
} {
  const filterId = `shape-text-shape-shadow-${hashString(JSON.stringify(shadow))}`

  return {
    filterId,
    markup: `<defs><filter id="${filterId}" filterUnits="userSpaceOnUse" x="${filterRegion.x}" y="${filterRegion.y}" width="${filterRegion.width}" height="${filterRegion.height}"><feDropShadow dx="${shadow.offsetX}" dy="${shadow.offsetY}" stdDeviation="${shadow.blur}" flood-color="${escapeXmlText(shadow.color)}" /></filter></defs>`,
  }
}
