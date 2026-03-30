import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    shapeTextTestApi: {
      renderScenario(name: string): void
      getState(): {
        scenario: string
        layout: {
          exhausted: boolean
          lines: Array<{
            text: string
            x: number
            width: number
            slot: { left: number; right: number }
          }>
        }
        svg: string
      }
    }
  }
}

async function getState(page: import('@playwright/test').Page) {
  return page.evaluate(() => window.shapeTextTestApi.getState())
}

test('renders the digit two fixture into SVG', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#stage svg')).toBeVisible()

  const state = await getState(page)

  expect(state.scenario).toBe('digit-two-wide')
  expect(state.layout.lines.length).toBeGreaterThan(4)
  expect(state.layout.exhausted).toBe(false)
  expect(state.layout.lines[0]?.text.length).toBeGreaterThan(0)
  await expect(page.locator('#stage text')).toHaveCount(state.layout.lines.length)
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
