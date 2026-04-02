import {
  createRandomFillText,
  randomFillPresets,
  type RandomFillPresetId,
} from 'shape-text'

export type FillPresetId = 'custom' | RandomFillPresetId

export const defaultCustomFillText =
  'ONE ONE ONE ONE ONE ONE ONE ONE ONE ONE ONE ONE '

export const fillPresets = [
  { id: 'custom', label: 'Custom' },
  ...randomFillPresets,
]

export function createPresetFillText(id: FillPresetId) {
  if (id === 'custom') {
    return defaultCustomFillText
  }

  return createRandomFillText({ preset: id })
}
