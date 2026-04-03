import { afterEach, describe, expect, it, vi } from 'vitest'

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

afterEach(() => {
  vi.unstubAllGlobals()
})

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

    expect(layout.lines.map(line => line.text)).toEqual(['ONEONEONEO', 'NEONEONEON', 'EONEONEONE'])
    expect(layout.autoFill).toBe(true)
    expect(layout.exhausted).toBe(false)
  })

  it('keeps spaces in the repeat stream while filling max coverage', () => {
    const layout = layoutTextInShape({
      text: 'A B',
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

    expect(layout.lines.map(line => line.text)).toEqual(['A BA BA BA', ' BA BA BA ', 'BA BA BA B'])
    expect(layout.lines.some(line => line.text.includes(' '))).toBe(true)
  })

  it('supports max fill by sweeping every slot in a band', () => {
    const layout = layoutTextInCompiledShape({
      text: 'A B',
      font: '16px Test Sans',
      autoFill: true,
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

    expect(layout.lines.map(line => [line.text, line.x, line.fillPass])).toEqual([
      ['A B', 0, 1],
      ['A B', 70, 1],
    ])
  })

  it('fills per-character text-mask regions sequentially while preserving region order', () => {
    const layout = layoutTextInCompiledShape({
      text: 'ABCD',
      font: '16px Test Sans',
      compiledShape: {
        kind: 'text-mask',
        source: {
          kind: 'text-mask',
          text: 'A B',
          font: '700 160px Test Sans',
          size: {
            mode: 'fixed',
            width: 80,
            height: 20,
          },
          shapeTextMode: 'per-character',
        },
        bounds: { left: 0, top: 0, right: 80, bottom: 20 },
        bandHeight: 20,
        minSlotWidth: 1,
        bands: [
          {
            top: 0,
            bottom: 20,
            intervals: [
              { left: 0, right: 20 },
              { left: 40, right: 60 },
            ],
          },
        ],
        regions: [
          {
            index: 0,
            grapheme: 'A',
            bounds: { left: 0, top: 0, right: 80, bottom: 20 },
            bands: [{ top: 0, bottom: 20, intervals: [{ left: 0, right: 20 }] }],
            debugView: {
              kind: 'text',
              text: 'A',
              font: '700 160px Test Sans',
              x: 0,
              baseline: 16,
            },
          },
          {
            index: 1,
            grapheme: 'B',
            bounds: { left: 0, top: 0, right: 80, bottom: 20 },
            bands: [{ top: 0, bottom: 20, intervals: [{ left: 40, right: 60 }] }],
            debugView: {
              kind: 'text',
              text: 'B',
              font: '700 160px Test Sans',
              x: 40,
              baseline: 16,
            },
          },
        ],
        debugView: {
          kind: 'text',
          text: 'A B',
          font: '700 160px Test Sans',
          x: 0,
          baseline: 16,
        },
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines.map(line => [line.text, line.x])).toEqual([
      ['AB', 0],
      ['CD', 40],
    ])
  })

  it('falls back to whole-shape flow when per-character regions are empty', () => {
    const layout = layoutTextInCompiledShape({
      text: 'ABCD',
      font: '16px Test Sans',
      compiledShape: {
        kind: 'text-mask',
        source: {
          kind: 'text-mask',
          text: 'III',
          font: '700 160px Test Sans',
          size: {
            mode: 'fixed',
            width: 60,
            height: 20,
          },
          shapeTextMode: 'per-character',
        },
        bounds: { left: 0, top: 0, right: 60, bottom: 20 },
        bandHeight: 20,
        minSlotWidth: 50,
        bands: [{ top: 0, bottom: 20, intervals: [{ left: 0, right: 60 }] }],
        regions: [],
        debugView: {
          kind: 'text',
          text: 'III',
          font: '700 160px Test Sans',
          x: 0,
          baseline: 16,
        },
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines.map(line => line.text)).toEqual(['ABCD'])
  })

  it('rejects empty max-fill input', () => {
    expect(() =>
      layoutTextInShape({
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
      }),
    ).toThrow('stream autoFill requires at least one grapheme')
  })

  it('rejects polygon points with NaN coordinates', () => {
    expect(() =>
      layoutTextInShape({
        text: 'abc',
        font: '16px Test Sans',
        lineHeight: 20,
        shape: {
          kind: 'polygon',
          points: [
            { x: Number.NaN, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 60 },
            { x: 0, y: 60 },
          ],
        },
        measurer: createFixedWidthTextMeasurer(),
      }),
    ).toThrow('polygon point coordinates must be finite numbers')
  })

  it('rejects polygon points with infinite coordinates', () => {
    expect(() =>
      layoutTextInShape({
        text: 'abc',
        font: '16px Test Sans',
        lineHeight: 20,
        shape: {
          kind: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: Number.POSITIVE_INFINITY, y: 0 },
            { x: 100, y: 60 },
            { x: 0, y: 60 },
          ],
        },
        measurer: createFixedWidthTextMeasurer(),
      }),
    ).toThrow('polygon point coordinates must be finite numbers')
  })

  it('keeps non-auto-fill empty text layout unchanged', () => {
    const layout = layoutTextInShape({
      text: '',
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

    expect(layout.lines).toHaveLength(0)
    expect(layout.exhausted).toBe(true)
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

  it('accepts svg-mask shapes through the high-level layout entrypoint', () => {
    class FakePath2D {
      bounds = { left: 0, right: 80 }

      constructor(_path: string) {}
    }

    class FakeCanvasContext {
      clearRect(): void {}

      fill(_path: FakePath2D): void {}

      getImageData(): ImageData {
        const data = new Uint8ClampedArray(80 * 40 * 4)

        for (let index = 3; index < data.length; index += 4) {
          data[index] = 255
        }

        return { data } as ImageData
      }

      setTransform(): void {}
    }

    class FakeOffscreenCanvas {
      getContext(kind: string): FakeCanvasContext | null {
        return kind === '2d' ? new FakeCanvasContext() : null
      }
    }

    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('Path2D', FakePath2D)

    const layout = layoutTextInShape({
      text: 'mot hai ba bon',
      font: '16px Test Sans',
      lineHeight: 20,
      shape: {
        kind: 'svg-mask',
        path: 'M 0 0 L 80 0 L 80 40 L 0 40 Z',
        viewBox: {
          width: 80,
          height: 40,
        },
        maskScale: 1,
      },
      measurer: createFixedWidthTextMeasurer(),
    })

    expect(layout.lines.map(line => line.text)).toEqual(['mot hai', 'ba bon'])
  })
})
