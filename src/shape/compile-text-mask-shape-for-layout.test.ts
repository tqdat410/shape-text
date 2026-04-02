import { afterEach, describe, expect, it, vi } from 'vitest'

import { compileShapeForLayout } from './compile-shape-for-layout.js'

function createMaskData(width: number, height: number, left: number, right: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = left; x < right; x++) {
      const alphaOffset = (y * width + x) * 4 + 3
      data[alphaOffset] = 255
    }
  }

  return data
}

class FakeCanvasContext {
  font = ''
  fillStyle = '#000000'
  textBaseline: CanvasTextBaseline = 'alphabetic'
  private lastDrawX = 0
  private lastText = ''

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {}

  clearRect(): void {}

  fillText(text: string, x: number): void {
    this.lastText = text
    this.lastDrawX = x
  }

  getImageData(): ImageData {
    const left = Math.max(0, Math.floor(this.lastDrawX))
    const right = Math.min(this.width, Math.ceil(this.lastDrawX + this.lastText.length * 40))
    return { data: createMaskData(this.width, this.height, left, right) } as ImageData
  }

  measureText(text: string): TextMetrics {
    return {
      width: text.length * 40,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: text.length * 40,
      actualBoundingBoxAscent: 40,
      actualBoundingBoxDescent: 0,
    } as TextMetrics
  }

  setTransform(): void {}
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

const fitContentShape = {
  kind: 'text-mask' as const,
  text: '23',
  font: '700 160px Test Sans',
  maskScale: 1,
}

const fixedShape = {
  kind: 'text-mask' as const,
  text: '2',
  font: '700 160px Test Sans',
  size: {
    mode: 'fixed' as const,
    width: 120,
    height: 160,
  },
  maskScale: 1,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('compileTextMaskShapeForLayout', () => {
  it('compiles a fixed text mask into reusable frozen bands', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('document', {
      fonts: {
        check: () => true,
      },
    })

    const first = compileShapeForLayout({
      shape: fixedShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })
    const second = compileShapeForLayout({
      shape: fixedShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(first.kind).toBe('text-mask')
    expect(first.bands).toHaveLength(8)
    expect(first.bands[0]?.intervals[0]).toEqual({ left: 40, right: 80 })
    expect(first.regions).toEqual([])
    expect(first).toBe(second)
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.bands)).toBe(true)
  })

  it('resolves fit-content bounds from the measured glyph text', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('document', {
      fonts: {
        check: () => true,
      },
    })

    const compiled = compileShapeForLayout({
      shape: fitContentShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(compiled.bounds).toEqual({ left: 0, top: 0, right: 80, bottom: 40 })
    expect(compiled.bands).toHaveLength(2)
    expect(compiled.bands[0]?.intervals[0]).toEqual({ left: 0, right: 80 })
  })

  it('compiles per-character text-mask regions and skips spaces', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('document', {
      fonts: {
        check: () => true,
      },
    })

    const compiled = compileShapeForLayout({
      shape: {
        ...fitContentShape,
        text: 'A B',
        shapeTextMode: 'per-character',
      },
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(compiled.regions).toHaveLength(2)
    expect(compiled.regions?.map(region => region.grapheme)).toEqual(['A', 'B'])
    expect(compiled.regions?.[0]?.bands[0]?.intervals[0]).toEqual({ left: 0, right: 40 })
    expect(compiled.regions?.[1]?.bands[0]?.intervals[0]).toEqual({ left: 80, right: 120 })
  })

  it('drops per-character regions that become empty after minSlotWidth filtering', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('document', {
      fonts: {
        check: () => true,
      },
    })

    const compiled = compileShapeForLayout({
      shape: {
        ...fitContentShape,
        text: 'III',
        shapeTextMode: 'per-character',
      },
      lineHeight: 20,
      minSlotWidth: 50,
    })

    expect(compiled.bands[0]?.intervals[0]).toEqual({ left: 0, right: 120 })
    expect(compiled.regions).toHaveLength(0)
  })

  it('rejects invalid alpha thresholds early', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('document', {
      fonts: {
        check: () => true,
      },
    })

    expect(() =>
      compileShapeForLayout({
        shape: {
          ...fixedShape,
          alphaThreshold: -1,
        },
        lineHeight: 20,
        minSlotWidth: 12,
      }),
    ).toThrow('alphaThreshold')
  })

  it('rejects invalid fixed sizes early', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('document', {
      fonts: {
        check: () => true,
      },
    })

    expect(() =>
      compileShapeForLayout({
        shape: {
          ...fitContentShape,
          size: {
            mode: 'fixed',
            width: 0,
            height: 160,
          },
        },
        lineHeight: 20,
        minSlotWidth: 12,
      }),
    ).toThrow('fixed width')
  })

  it('skips cache writes until the font is ready', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    const check = vi.fn(() => false)
    vi.stubGlobal('document', {
      fonts: {
        check,
      },
    })

    const beforeReadyA = compileShapeForLayout({
      shape: fixedShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })
    const beforeReadyB = compileShapeForLayout({
      shape: fixedShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(beforeReadyA).not.toBe(beforeReadyB)

    check.mockReturnValue(true)

    const afterReadyA = compileShapeForLayout({
      shape: fixedShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })
    const afterReadyB = compileShapeForLayout({
      shape: fixedShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(afterReadyA).toBe(afterReadyB)
  })
})
