export type RandomFillPresetId = 'ascii' | 'binary' | 'hex' | 'octal' | 'symbol'

export type RandomFillPreset = {
  id: RandomFillPresetId
  label: string
  alphabet: string
  defaultLength: number
}

export const randomFillPresets = [
  {
    id: 'ascii',
    label: 'ASCII',
    alphabet:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>?/|+-=',
    defaultLength: 96,
  },
  { id: 'binary', label: 'BINARY', alphabet: '01', defaultLength: 128 },
  { id: 'hex', label: 'HEX', alphabet: '0123456789ABCDEF', defaultLength: 112 },
  { id: 'octal', label: 'OCTAL', alphabet: '01234567', defaultLength: 120 },
  { id: 'symbol', label: 'SYMBOL', alphabet: '<>[]{}()/\\|+-=_*#@~', defaultLength: 96 },
] as const satisfies readonly RandomFillPreset[]

export function getRandomFillPreset(id: RandomFillPresetId) {
  return randomFillPresets.find(preset => preset.id === id)
}
