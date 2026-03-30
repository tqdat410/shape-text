import { describe, expect, it } from 'vitest'

import { layoutTextInShape } from '../layout/layout-text-in-shape.js'
import { renderLayoutToSvg } from './render-layout-to-svg.js'
import type { TextMeasurer } from '../types.js'

const measurer: TextMeasurer = {
  measureText(text) {
    return Array.from(text).length * 10
  },
}

describe('renderLayoutToSvg', () => {
  it('renders svg text nodes and escapes text', () => {
    const layout = layoutTextInShape({
      text: 'xin <chao>',
      font: '16px Test Sans',
      lineHeight: 20,
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 40 },
          { x: 0, y: 40 },
        ],
      },
      measurer,
    })

    const svg = renderLayoutToSvg(layout, { showShape: true, background: '#fff' })

    expect(svg).toContain('<svg')
    expect(svg).toContain('&lt;chao&gt;')
    expect(svg).toContain('<polygon')
    expect(svg).toContain('<text')
  })
})
