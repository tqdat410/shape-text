import {
  createRandomFillText,
  type RandomFillPresetId,
  type RandomIntSelector,
} from 'shape-text'

const presetCycle: RandomFillPresetId[] = ['hex', 'binary', 'symbol', 'octal', 'ascii']
const fillLength = 160

type CreateClockFillTextOptions = {
  randomInt?: RandomIntSelector
}

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

function getRandomPreset(randomInt: RandomIntSelector): RandomFillPresetId {
  return presetCycle[randomInt(presetCycle.length)]!
}

export function createClockFillText(options: CreateClockFillTextOptions): string {
  const randomInt = options.randomInt ?? createDefaultRandomIntSelector()

  return createRandomFillText({
    preset: getRandomPreset(randomInt),
    length: fillLength,
    randomInt,
  })
}

export function resolveClockGlyphFills(
  previousClockValue: string,
  nextClockValue: string,
  previousGlyphFills: string[],
): string[] {
  return Array.from(nextClockValue, (glyph, index) =>
    previousClockValue[index] === glyph
      ? previousGlyphFills[index] ?? createClockFillText({})
      : createClockFillText({}),
  )
}
