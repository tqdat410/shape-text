import { afterEach, describe, expect, it, vi } from 'vitest'

import { layoutTextInShape } from '../layout/layout-text-in-shape.js'
import { compileShapeForLayout } from './compile-shape-for-layout.js'

function createMaskData(width: number, height: number, left: number, right: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = left; x < right; x++) {
      data[(y * width + x) * 4 + 3] = 255
    }
  }

  return data
}

class FakePath2D {
  bounds: { left: number; right: number }

  constructor(path: string) {
    const values = Array.from(path.matchAll(/-?\d+(?:\.\d+)?/g), match => Number(match[0]))
    const xs: number[] = []

    for (let index = 0; index < values.length; index += 2) {
      xs.push(values[index]!)
    }

    this.bounds = {
      left: Math.min(...xs),
      right: Math.max(...xs),
    }
  }
}

class FakeCanvasContext {
  fillStyle = '#000000'
  private transform = { a: 1, e: 0 }
  private maskBounds = { left: 0, right: 0 }

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {}

  clearRect(): void {
    this.maskBounds = { left: 0, right: 0 }
  }

  fill(path: FakePath2D): void {
    this.maskBounds = {
      left: Math.max(0, Math.floor(path.bounds.left * this.transform.a + this.transform.e)),
      right: Math.min(this.width, Math.ceil(path.bounds.right * this.transform.a + this.transform.e)),
    }
  }

  getImageData(): ImageData {
    return {
      data: createMaskData(this.width, this.height, this.maskBounds.left, this.maskBounds.right),
    } as ImageData
  }

  setTransform(a: number, _b: number, _c: number, _d: number, e: number): void {
    this.transform = { a, e }
  }
}

class FakeOffscreenCanvas {
  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {}

  getContext(kind: string): FakeCanvasContext | null {
    if (kind !== '2d') {
      return null
    }

    return new FakeCanvasContext(this.width, this.height)
  }
}

const svgMaskShape = {
  kind: 'svg-mask' as const,
  path: 'M 0 0 L 80 0 L 80 40 L 0 40 Z',
  viewBox: {
    width: 80,
    height: 40,
  },
  maskScale: 1,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('compileSvgMaskShapeForLayout', () => {
  it('compiles and caches fit-content svg-mask bands', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('Path2D', FakePath2D)

    const first = compileShapeForLayout({
      shape: svgMaskShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })
    const second = compileShapeForLayout({
      shape: svgMaskShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(first.kind).toBe('svg-mask')
    expect(first.bounds).toEqual({ left: 0, top: 0, right: 80, bottom: 40 })
    expect(first.bands[0]?.intervals[0]).toEqual({ left: 0, right: 80 })
    expect(first.debugView.kind).toBe('path')
    expect(first).toBe(second)
  })

  it('supports fixed svg-mask sizing', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('Path2D', FakePath2D)

    const compiled = compileShapeForLayout({
      shape: {
        ...svgMaskShape,
        size: {
          mode: 'fixed',
          width: 120,
          height: 80,
          padding: 10,
        },
      },
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(compiled.bounds).toEqual({ left: 0, top: 0, right: 120, bottom: 80 })
    expect(compiled.bands).toHaveLength(4)
  })

  it('rejects invalid svg-mask inputs early', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('Path2D', FakePath2D)

    expect(() =>
      compileShapeForLayout({
        shape: {
          ...svgMaskShape,
          path: '   ',
        },
        lineHeight: 20,
        minSlotWidth: 12,
      }),
    ).toThrow('non-empty path')

    expect(() =>
      compileShapeForLayout({
        shape: {
          ...svgMaskShape,
          viewBox: {
            width: 0,
            height: 40,
          },
        },
        lineHeight: 20,
        minSlotWidth: 12,
      }),
    ).toThrow('viewBox.width')
  })

  it('lays out text inside an svg-mask shape', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('Path2D', FakePath2D)

    const layout = layoutTextInShape({
      text: 'AAAA BBBB CCCC',
      font: '16px Test Sans',
      lineHeight: 20,
      shape: svgMaskShape,
      measurer: {
        measureText(text: string) {
          return text.length * 10
        },
      },
    })

    expect(layout.lines.map(line => line.text)).toEqual(['AAAA', 'BBBB'])
  })
})
