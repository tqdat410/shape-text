import { describe, expect, it } from 'vitest'
import { createIctClockLayoutOptions } from './create-ict-clock-svg'

describe('createIctClockLayoutOptions', () => {
  it('builds soft-light non-bold max-fill text-mask options for a single clock glyph', () => {
    const measurer = {
      measureText(text: string) {
        return text.length * 8
      },
    }

    const options = createIctClockLayoutOptions({
      clockValue: '8',
      fillText: 'CLOCK '.repeat(80),
      measurer,
    })

    expect(options.autoFill).toBe(true)
    expect(options.textStyle?.color).toBe('#f1dfcf')
    expect(options.textStyle?.weight).toBe(400)
    expect(options.shape).toEqual({
      kind: 'text-mask',
      text: '8',
      font: '700 340px Ubuntu',
      size: {
        mode: 'fit-content',
        padding: 16,
      },
    })
  })
})
