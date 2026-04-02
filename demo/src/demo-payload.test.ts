import { describe, expect, it } from 'vitest'

import { createDefaultDemoRequest } from './demo-model'
import { parseDemoRequest } from './demo-payload'
import { identifyGeometryPresetId } from './demo-presets'

describe('parseDemoRequest', () => {
  it('preserves omitted nested fields during partial payload merges', () => {
    const fallback = createDefaultDemoRequest()
    fallback.layout.autoFill = true
    fallback.layout.textStyle.style = 'italic'

    const nextRequest = parseDemoRequest(
      JSON.stringify({
        layout: {
          textStyle: {
            size: 30,
          },
        },
        render: {},
      }),
      fallback,
    )

    expect(nextRequest.layout.textStyle.size).toBe(30)
    expect(nextRequest.layout.textStyle.style).toBe('italic')
    expect(nextRequest.layout.autoFill).toBe(true)
  })

  it('marks non-matching polygon shapes as custom geometry', () => {
    const nextRequest = parseDemoRequest(
      JSON.stringify({
        layout: {
          shape: {
            kind: 'polygon',
            points: [
              { x: 0, y: 0 },
              { x: 200, y: 0 },
              { x: 120, y: 220 },
            ],
          },
        },
        render: {},
      }),
      createDefaultDemoRequest(),
    )

    expect(nextRequest.layout.shape.kind).toBe('polygon')
    if (nextRequest.layout.shape.kind !== 'polygon') {
      throw new Error('Expected polygon shape')
    }

    expect(identifyGeometryPresetId(nextRequest.layout.shape)).toBe('custom')
  })

  it('keeps textStyle weight 500 when the payload provides it directly', () => {
    const nextRequest = parseDemoRequest(
      JSON.stringify({
        layout: {
          textStyle: {
            weight: 500,
          },
        },
        render: {},
      }),
      createDefaultDemoRequest(),
    )

    expect(nextRequest.layout.textStyle.weight).toBe(500)
  })
})
