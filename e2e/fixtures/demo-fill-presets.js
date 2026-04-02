function createSeededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function createRandomText(alphabet, length, seed) {
  const random = createSeededRandom(seed)
  let text = ''

  for (let index = 0; index < length; index++) {
    const nextIndex = Math.floor(random() * alphabet.length)
    text += alphabet[nextIndex]
  }

  return text
}

export const fillTextPresets = [
  { id: 'custom', label: 'Custom' },
  { id: 'ascii-random', label: 'ASCII', alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}<>?/|+-=', length: 96, seed: 0x41534349 },
  { id: 'binary-random', label: 'BINARY', alphabet: '01', length: 128, seed: 0x42494e41 },
  { id: 'hex-random', label: 'HEX', alphabet: '0123456789ABCDEF', length: 112, seed: 0x48455821 },
  { id: 'octal-random', label: 'OCTAL', alphabet: '01234567', length: 120, seed: 0x4f435441 },
  { id: 'symbol-random', label: 'SYMBOL', alphabet: '<>[]{}()/\\|+-=_*#@~', length: 96, seed: 0x53594d42 },
]

export function findFillTextPresetById(id) {
  return fillTextPresets.find(preset => preset.id === id) ?? fillTextPresets[0]
}

export function identifyFillTextPresetId(text) {
  for (let index = 0; index < fillTextPresets.length; index++) {
    const preset = fillTextPresets[index]
    if (preset.id !== 'custom' && resolveFillTextPresetText(preset.id) === text) {
      return preset.id
    }
  }

  return 'custom'
}

export function resolveFillTextPresetText(id) {
  const preset = findFillTextPresetById(id)
  if (preset.id === 'custom') {
    return null
  }

  return createRandomText(preset.alphabet, preset.length, preset.seed)
}
