import { getRandomFillPreset, type RandomFillPresetId } from './random-fill-presets.js'

export type RandomIntSelector = (max: number) => number

export type CreateRandomFillTextOptions =
  | {
      preset: RandomFillPresetId
      length?: number
      randomInt?: RandomIntSelector
    }
  | {
      alphabet: string
      length: number
      randomInt?: RandomIntSelector
    }

const graphemeSegmenter =
  typeof Intl?.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

function createDefaultRandomIntSelector(): RandomIntSelector {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const buffer = new Uint32Array(1)

    return max => {
      globalThis.crypto.getRandomValues(buffer)
      return buffer[0]! % max
    }
  }

  return max => Math.floor(Math.random() * max)
}

function segmentAlphabet(alphabet: string) {
  if (!alphabet) {
    throw new Error('Random fill alphabet must not be empty')
  }

  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(alphabet), segment => segment.segment)
  }

  return Array.from(alphabet)
}

function getAlphabetSymbols(options: CreateRandomFillTextOptions) {
  if ('alphabet' in options) {
    return segmentAlphabet(options.alphabet)
  }

  const preset = getRandomFillPreset(options.preset)
  if (!preset) {
    throw new Error(`Unknown random fill preset: ${String(options.preset)}`)
  }

  return segmentAlphabet(preset.alphabet)
}

function getLength(options: CreateRandomFillTextOptions) {
  if ('alphabet' in options) {
    return options.length
  }

  if (options.length !== undefined) {
    return options.length
  }

  const preset = getRandomFillPreset(options.preset)
  if (!preset) {
    throw new Error(`Unknown random fill preset: ${String(options.preset)}`)
  }

  return preset.defaultLength
}

function assertValidLength(length: number) {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('Random fill length must be a positive integer')
  }

  return length
}

function getRandomIndex(randomInt: RandomIntSelector, alphabetLength: number) {
  const value = randomInt(alphabetLength)

  if (!Number.isInteger(value) || value < 0 || value >= alphabetLength) {
    throw new Error('Random fill selector must return an integer between 0 and max - 1')
  }

  return value
}

export function createRandomFillText(options: CreateRandomFillTextOptions) {
  const alphabet = getAlphabetSymbols(options)
  const length = assertValidLength(getLength(options))
  const randomInt = options.randomInt ?? createDefaultRandomIntSelector()
  let text = ''

  for (let index = 0; index < length; index++) {
    text += alphabet[getRandomIndex(randomInt, alphabet.length)]!
  }

  return text
}
