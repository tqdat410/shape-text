export function getMillisecondsUntilNextSecond(value: Date = new Date()): number {
  const remainder = value.getMilliseconds()
  return remainder === 0 ? 1_000 : 1_000 - remainder
}
