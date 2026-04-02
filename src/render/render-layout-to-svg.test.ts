import { describe, expect, it } from 'vitest'

import { layoutTextInShape } from '../layout/layout-text-in-shape.js'
import { renderLayoutToSvg } from './render-layout-to-svg.js'
import type { ShapeTextLayout, TextMeasurer } from '../types.js'

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

  it('uses textStyle color by default and shapeStyle decoration when requested', () => {
    const layout = layoutTextInShape({
      text: 'shape text',
      textStyle: {
        family: 'Test Sans',
        size: 20,
        weight: 700,
        style: 'italic',
        color: '#dc2626',
      },
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

    const svg = renderLayoutToSvg(layout, {
      shapeStyle: {
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
        borderWidth: 4,
        shadow: {
          color: 'rgba(15, 23, 42, 0.25)',
          blur: 6,
          offsetX: 2,
          offsetY: 3,
        },
      },
    })

    expect(svg).toContain('fill="#dc2626"')
    expect(svg).toContain('stroke="#f59e0b"')
    expect(svg).toContain('stroke-width="4"')
    expect(svg).toContain('fill="#fef3c7"')
    expect(svg).toContain('<filter id="shape-text-shape-shadow-')
    expect(svg).toContain('filterUnits="userSpaceOnUse"')
    expect(svg).toContain('style="font:italic 700 20px Test Sans;"')
  })

  it('lets render options override text fill color for the same layout', () => {
    const layout = layoutTextInShape({
      text: 'override',
      textStyle: {
        family: 'Test Sans',
        size: 16,
        color: '#2563eb',
      },
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

    const svg = renderLayoutToSvg(layout, {
      textFill: '#16a34a',
    })

    expect(svg).toContain('fill="#16a34a"')
    expect(svg).not.toContain('fill="#2563eb"')
  })

  it('renders line-level font overrides when a line provides its own font', () => {
    const svg = renderLayoutToSvg({
      font: '16px Test Sans',
      lineHeight: 20,
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 120, y: 0 },
          { x: 120, y: 40 },
          { x: 0, y: 40 },
        ],
      },
      compiledShape: {
        kind: 'polygon',
        source: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 120, y: 0 },
            { x: 120, y: 40 },
            { x: 0, y: 40 },
          ],
        },
        bounds: { left: 0, top: 0, right: 120, bottom: 40 },
        bandHeight: 20,
        minSlotWidth: 16,
        bands: [],
        debugView: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 120, y: 0 },
            { x: 120, y: 40 },
            { x: 0, y: 40 },
          ],
        },
      },
      bounds: { left: 0, top: 0, right: 120, bottom: 40 },
      lines: [
        {
          text: 'BASE',
          width: 40,
          start: { tokenIndex: 0, graphemeIndex: 0 },
          end: { tokenIndex: 4, graphemeIndex: 0 },
          x: 0,
          top: 0,
          baseline: 16,
          slot: { left: 0, right: 60 },
          fillPass: 1,
        },
        {
          text: 'mini',
          width: 24,
          start: { tokenIndex: 4, graphemeIndex: 0 },
          end: { tokenIndex: 8, graphemeIndex: 0 },
          x: 60,
          top: 12,
          baseline: 24,
          slot: { left: 60, right: 96 },
          font: '11.52px Test Sans',
          fillPass: 2,
        },
      ],
      exhausted: false,
      autoFill: true,
    } satisfies ShapeTextLayout)

    expect(svg).toContain('style="font:16px Test Sans;"')
    expect(svg).toContain('style="font:11.52px Test Sans;"')
  })

  it('does not inject a border when shapeStyle only sets background color', () => {
    const layout = layoutTextInShape({
      text: 'fill only',
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

    const svg = renderLayoutToSvg(layout, {
      shapeStyle: {
        backgroundColor: '#fef3c7',
      },
    })

    expect(svg).toContain('stroke-width="0"')
    expect(svg).toContain('fill="#fef3c7"')
  })

  it('expands the viewport for borders and shadows without manual padding', () => {
    const layout = layoutTextInShape({
      text: 'shadow',
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

    const svg = renderLayoutToSvg(layout, {
      padding: 0,
      shapeStyle: {
        borderColor: '#0f172a',
        borderWidth: 8,
        shadow: {
          blur: 10,
          offsetX: 6,
          offsetY: 4,
        },
      },
    })

    expect(svg).toContain('viewBox="-34 -34 274 112"')
  })

  it('renders a legacy layout object without textStyle metadata', () => {
    const svg = renderLayoutToSvg({
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
      compiledShape: {
        kind: 'polygon',
        source: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 200, y: 0 },
            { x: 200, y: 40 },
            { x: 0, y: 40 },
          ],
        },
        bounds: { left: 0, top: 0, right: 200, bottom: 40 },
        bandHeight: 20,
        minSlotWidth: 16,
        bands: [],
        debugView: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 200, y: 0 },
            { x: 200, y: 40 },
            { x: 0, y: 40 },
          ],
        },
      },
      bounds: { left: 0, top: 0, right: 200, bottom: 40 },
      lines: [],
      exhausted: true,
      autoFill: false,
    } satisfies ShapeTextLayout)

    expect(svg).toContain('<svg')
    expect(svg).not.toContain('undefined')
  })
})
