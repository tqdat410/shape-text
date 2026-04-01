import { describe, expect, it } from 'vitest'

import { compileShapeForLayout } from '../shape/compile-shape-for-layout.js'
import { layoutTextInCompiledShape } from './layout-text-in-compiled-shape.js'
import { layoutTextInShape } from './layout-text-in-shape.js'
import type { TextMeasurer } from '../types.js'

function createFixedWidthTextMeasurer(unit = 10): TextMeasurer {
  return {
    measureText(text) {
      return Array.from(text).length * unit
    },
  }
}

describe('layoutTextInShape', () => {
  it('lays out words into a rectangle', () => {
    const layout = layoutTextInShape({
      text: 'mot hai ba bon nam sau',
      font: '16px Test Sans',
      lineHeight: 20,
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 60 },
          { x: 0, y: 60 },
        ],
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines.map(line => line.text)).toEqual(['mot hai ba', 'bon nam', 'sau'])
    expect(layout.exhausted).toBe(true)
  })

  it('breaks a long word by grapheme when a slot is narrow', () => {
    const layout = layoutTextInShape({
      text: 'abcdef',
      font: '16px Test Sans',
      lineHeight: 20,
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 30, y: 0 },
          { x: 30, y: 60 },
          { x: 0, y: 60 },
        ],
      },
      measurer: createFixedWidthTextMeasurer(),
      minSlotWidth: 1,
    })

    expect(layout.lines.map(line => line.text)).toEqual(['abc', 'def'])
  })

  it('reuses a compiled polygon shape through the lower-level API', () => {
    const compiledShape = compileShapeForLayout({
      lineHeight: 20,
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 60 },
          { x: 0, y: 60 },
        ],
      },
    })

    const layout = layoutTextInCompiledShape({
      text: 'mot hai ba bon nam sau',
      font: '16px Test Sans',
      compiledShape,
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines.map(line => line.text)).toEqual(['mot hai ba', 'bon nam', 'sau'])
    expect(layout.compiledShape.bands).toHaveLength(3)
  })

  it('auto-fills a shape by repeating the content text', () => {
    const layout = layoutTextInShape({
      text: 'ONE',
      font: '16px Test Sans',
      lineHeight: 20,
      autoFill: true,
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 60 },
          { x: 0, y: 60 },
        ],
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines.map(line => line.text)).toEqual(['ONE ONE', 'ONE ONE', 'ONE ONE'])
    expect(layout.autoFill).toBe(true)
    expect(layout.autoFillMode).toBe('words')
    expect(layout.exhausted).toBe(false)
  })

  it('supports dense auto-fill by ignoring spaces and word boundaries', () => {
    const layout = layoutTextInShape({
      text: 'ONE',
      font: '16px Test Sans',
      lineHeight: 20,
      autoFill: true,
      autoFillMode: 'dense',
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 60 },
          { x: 0, y: 60 },
        ],
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.autoFillMode).toBe('dense')
    expect(layout.lines[0]?.text).toBe('ONEONEONEO')
    expect(layout.lines[0]?.width).toBe(100)
    expect(layout.lines[0]?.text).not.toContain(' ')
  })

  it('supports max fill by sweeping every slot in a band', () => {
    const layout = layoutTextInCompiledShape({
      text: 'A B',
      font: '16px Test Sans',
      autoFill: true,
      fillStrategy: 'max',
      compiledShape: {
        kind: 'polygon',
        source: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 8 },
            { x: 0, y: 8 },
          ],
        },
        bounds: { left: 0, top: 0, right: 100, bottom: 8 },
        bandHeight: 8,
        minSlotWidth: 1,
        bands: [
          {
            top: 0,
            bottom: 8,
            intervals: [
              { left: 0, right: 30 },
              { left: 70, right: 100 },
            ],
          },
        ],
        debugView: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 8 },
            { x: 0, y: 8 },
          ],
        },
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.fillStrategy).toBe('max')
    expect(layout.autoFillMode).toBe('stream')
    expect(layout.lines.map(line => [line.text, line.x, line.fillPass])).toEqual([
      ['A B', 0, 1],
      ['A B', 70, 1],
    ])
  })

  it('strips whitespace and continues dense fill across line boundaries', () => {
    const layout = layoutTextInShape({
      text: 'A B',
      font: '16px Test Sans',
      lineHeight: 20,
      autoFill: true,
      autoFillMode: 'dense',
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 50, y: 40 },
          { x: 0, y: 40 },
        ],
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines.map(line => line.text)).toEqual(['ABABA', 'BABAB'])
  })

  it('rejects dense auto-fill when the source becomes whitespace-only', () => {
    expect(() =>
      layoutTextInShape({
        text: ' \n\t ',
        font: '16px Test Sans',
        lineHeight: 20,
        autoFill: true,
        autoFillMode: 'dense',
        shape: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 60 },
            { x: 0, y: 60 },
          ],
        },
        measurer: createFixedWidthTextMeasurer(),
      }),
    ).toThrow('dense autoFill requires at least one non-whitespace grapheme')
  })

  it('keeps empty word auto-fill exhausted state unchanged', () => {
    const layout = layoutTextInShape({
      text: '',
      font: '16px Test Sans',
      lineHeight: 20,
      autoFill: true,
      shape: {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 60 },
          { x: 0, y: 60 },
        ],
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines).toHaveLength(0)
    expect(layout.exhausted).toBe(true)
    expect(layout.autoFillMode).toBe('words')
  })

  it('normalizes textStyle into the resolved layout font and color', () => {
    const layout = layoutTextInShape({
      text: 'xin chao',
      textStyle: {
        family: 'Test Sans',
        size: 18,
        weight: 700,
        style: 'italic',
        color: '#2563eb',
      },
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
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.font).toBe('italic 700 18px Test Sans')
    expect(layout.textStyle?.color).toBe('#2563eb')
  })
})
