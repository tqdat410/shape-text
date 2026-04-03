import { describe, expect, it } from 'vitest'
import { createReachingHandLayoutOptions } from './create-reaching-hand-svg'

describe('createReachingHandLayoutOptions', () => {
  it('builds a skin-tone non-bold svg-mask hand fill layout', () => {
    const options = createReachingHandLayoutOptions({
      fillText: 'HAND '.repeat(120),
      measurer: {
        measureText(text: string) {
          return text.length * 4
        },
      },
    })

    expect(options.autoFill).toBe(true)
    expect(options.textStyle?.color).toBe('#d8a07f')
    expect(options.textStyle?.weight).toBe(400)
    expect(options.shape.kind).toBe('svg-mask')
    if (options.shape.kind !== 'svg-mask') {
      throw new Error('Expected svg-mask shape')
    }
    expect(options.shape.path.length).toBeGreaterThan(0)
    expect(options.shape.viewBox.width).toBeGreaterThan(0)
    expect(options.shape.viewBox.height).toBeGreaterThan(options.shape.viewBox.width)
  })
})
