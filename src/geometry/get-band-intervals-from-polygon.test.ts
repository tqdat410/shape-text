import { describe, expect, it } from 'vitest'

import { getBandIntervalsFromPolygon } from './get-band-intervals-from-polygon.js'

describe('getBandIntervalsFromPolygon', () => {
  it('rejects non-finite polygon points for direct helper callers', () => {
    expect(() =>
      getBandIntervalsFromPolygon(
        [
          { x: 0, y: 0 },
          { x: Number.POSITIVE_INFINITY, y: 0 },
          { x: 120, y: 80 },
        ],
        0,
        20,
      ),
    ).toThrow('polygon point coordinates must be finite numbers')
  })
})
