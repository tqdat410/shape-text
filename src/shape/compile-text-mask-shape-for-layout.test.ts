import { afterEach, describe, expect, it, vi } from 'vitest'

import { compileShapeForLayout } from './compile-shape-for-layout.js'

function createMaskData(width: number, height: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 10; x < width - 10; x++) {
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

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {}

  clearRect(): void {}

  fillText(): void {}

  getImageData(): ImageData {
    return { data: createMaskData(this.width, this.height) } as ImageData
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

const baseShape = {
  kind: 'text-mask' as const,
  text: '2',
  font: '700 160px Test Sans',
  width: 120,
  height: 160,
  maskScale: 1,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('compileTextMaskShapeForLayout', () => {
  it('compiles a text mask into reusable frozen bands', () => {
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas)
    vi.stubGlobal('document', {
      fonts: {
        check: () => true,
      },
    })

    const first = compileShapeForLayout({
      shape: baseShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })
    const second = compileShapeForLayout({
      shape: baseShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(first.kind).toBe('text-mask')
    expect(first.bands).toHaveLength(8)
    expect(first.bands[0]?.intervals[0]).toEqual({ left: 10, right: 110 })
    expect(first).toBe(second)
    expect(Object.isFrozen(first)).toBe(true)
    expect(Object.isFrozen(first.bands)).toBe(true)
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
          ...baseShape,
          alphaThreshold: -1,
        },
        lineHeight: 20,
        minSlotWidth: 12,
      }),
    ).toThrow('alphaThreshold')
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
      shape: baseShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })
    const beforeReadyB = compileShapeForLayout({
      shape: baseShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(beforeReadyA).not.toBe(beforeReadyB)

    check.mockReturnValue(true)

    const afterReadyA = compileShapeForLayout({
      shape: baseShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })
    const afterReadyB = compileShapeForLayout({
      shape: baseShape,
      lineHeight: 20,
      minSlotWidth: 12,
    })

    expect(afterReadyA).toBe(afterReadyB)
  })
})
