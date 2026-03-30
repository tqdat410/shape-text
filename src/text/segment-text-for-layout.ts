import type { PreparedLayoutToken } from '../types.js'

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

function segmentGraphemes(word: string): string[] {
  return Array.from(graphemeSegmenter.segment(word), segment => segment.segment)
}

export function segmentTextForLayout(text: string): Array<Pick<PreparedLayoutToken, 'kind' | 'text'>> {
  const normalizedLines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/[^\S\n]+/g, ' ').trim())

  const tokens: Array<Pick<PreparedLayoutToken, 'kind' | 'text'>> = []

  for (let lineIndex = 0; lineIndex < normalizedLines.length; lineIndex++) {
    const line = normalizedLines[lineIndex]!

    if (line.length > 0) {
      const words = line.split(' ')
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        const word = words[wordIndex]!
        if (word.length === 0) continue
        tokens.push({ kind: 'word', text: word })
      }
    }

    if (lineIndex < normalizedLines.length - 1) {
      tokens.push({ kind: 'newline', text: '\n' })
    }
  }

  return tokens
}

export function createMeasuredWordToken(
  text: string,
  measureWord: (value: string) => number,
): PreparedLayoutToken {
  const graphemes = segmentGraphemes(text)
  const graphemePrefixWidths = [0]

  for (let index = 0; index < graphemes.length; index++) {
    const width = measureWord(graphemes[index]!)
    graphemePrefixWidths.push(graphemePrefixWidths[index]! + width)
  }

  return {
    kind: 'word',
    text,
    width: graphemePrefixWidths[graphemePrefixWidths.length - 1]!,
    graphemes,
    graphemePrefixWidths,
  }
}

