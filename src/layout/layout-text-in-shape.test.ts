import { describe, expect, it } from 'vitest'

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
})
