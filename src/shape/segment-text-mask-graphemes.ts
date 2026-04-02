const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export type TextMaskGraphemePlacement = {
  grapheme: string
  drawX: number
  isWhitespace: boolean
}

function isWhitespaceGrapheme(grapheme: string): boolean {
  return grapheme.trim().length === 0
}

export function segmentTextMaskGraphemes(
  text: string,
  originX: number,
  measureAdvance: (value: string) => number,
): TextMaskGraphemePlacement[] {
  const segments = Array.from(graphemeSegmenter.segment(text), segment => segment.segment)
  const placements: TextMaskGraphemePlacement[] = []
  let prefix = ''

  for (let index = 0; index < segments.length; index++) {
    const grapheme = segments[index]!
    placements.push({
      grapheme,
      drawX: originX + measureAdvance(prefix),
      isWhitespace: isWhitespaceGrapheme(grapheme),
    })
    prefix += grapheme
  }

  return placements
}
