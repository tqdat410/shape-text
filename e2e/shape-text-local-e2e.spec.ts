import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    shapeTextTestApi: {
      renderScenario(name: string): void
      compileScenarioTwice(name: string): {
        sameReference: boolean
        isFrozen: boolean
        bandCount: number
        shapeKind: string
      }
      compileInvalidTextMaskShape(): string | null
      getState(): {
        scenario: string
        layout: {
          autoFill: boolean
          exhausted: boolean
          lines: Array<{
            text: string
            x: number
            width: number
            slot: { left: number; right: number }
          }>
        }
        text: string
        svg: string
      }
    }
  }
}

async function getState(page: import('@playwright/test').Page) {
  return page.evaluate(() => window.shapeTextTestApi.getState())
}

test('renders the glyph text-mask fixture into SVG', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#stage svg')).toBeVisible()

  const state = await getState(page)

  expect(state.scenario).toBe('glyph-two-repeat')
  expect(state.text).toBe('ONE')
  expect(state.layout.lines.length).toBeGreaterThan(4)
  expect(state.layout.autoFill).toBe(true)
  expect(state.layout.exhausted).toBe(false)
  expect(state.layout.lines[0]?.text).toContain('ONE')
  await expect(page.locator('#stage text')).toHaveCount(state.layout.lines.length)
})

test('reuses the cached compiled glyph shape for repeated text-mask requests', async ({
  page,
}) => {
  await page.goto('/')

  const result = await page.evaluate(() =>
    window.shapeTextTestApi.compileScenarioTwice('glyph-two-repeat'),
  )

  expect(result.shapeKind).toBe('text-mask')
  expect(result.bandCount).toBeGreaterThan(4)
  expect(result.sameReference).toBe(true)
  expect(result.isFrozen).toBe(true)
})

test('rejects invalid text-mask alpha thresholds with a clear error', async ({ page }) => {
  await page.goto('/')

  const errorMessage = await page.evaluate(() => window.shapeTextTestApi.compileInvalidTextMaskShape())

  expect(errorMessage).toContain('alphaThreshold')
})

test('reflows into more lines in the narrow rectangle scenario', async ({ page }) => {
  await page.goto('/')

  await page.evaluate(() => window.shapeTextTestApi.renderScenario('rectangle-wide'))
  const wideState = await getState(page)
  await page.evaluate(() => window.shapeTextTestApi.renderScenario('rectangle-narrow'))
  const narrowState = await getState(page)

  expect(narrowState.layout.lines.length).toBeGreaterThan(wideState.layout.lines.length)
  expect(narrowState.layout.lines[0]?.text).not.toBe('')
})

test('keeps each rendered line inside its chosen slot', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.shapeTextTestApi.renderScenario('rectangle-wide'))

  const state = await getState(page)

  for (const line of state.layout.lines) {
    expect(line.x).toBeGreaterThanOrEqual(line.slot.left)
    expect(line.x + line.width).toBeLessThanOrEqual(line.slot.right + 0.5)
  }

  expect(state.svg).toContain('<svg')
  expect(state.svg).toContain('<text')
})
