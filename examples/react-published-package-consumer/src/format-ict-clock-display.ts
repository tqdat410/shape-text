const ictClockFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Bangkok',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function formatIctClockDisplay(value: Date = new Date()): string {
  return ictClockFormatter
    .formatToParts(value)
    .filter(part => part.type !== 'literal')
    .map(part => part.value)
    .join(':')
}
