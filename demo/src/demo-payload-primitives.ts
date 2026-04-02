export function assertObject(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }

  return value as Record<string, unknown>
}

export function readFiniteNumber(value: unknown, label: string, allowZero = false) {
  const number = Number(value)
  if (!Number.isFinite(number) || (!allowZero && number <= 0)) {
    throw new Error(`${label} must be a finite ${allowZero ? 'number' : 'positive number'}`)
  }

  return number
}

export function hasOwnProperty(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key)
}
