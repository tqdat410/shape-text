import { createRandomFillText, type RandomFillPresetId } from 'shape-text'

const presetCycle: RandomFillPresetId[] = ['hex', 'binary', 'symbol', 'octal', 'ascii']
const chunkLengths = [56, 34, 28, 40, 48]
const chunkCount = 24

export function createReachingHandFillText(): string {
  return Array.from({ length: chunkCount }, (_, index) =>
    createRandomFillText({
      preset: presetCycle[index % presetCycle.length]!,
      length: chunkLengths[index % chunkLengths.length]!,
    }),
  ).join(' ')
}
