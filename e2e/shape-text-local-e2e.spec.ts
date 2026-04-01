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
          autoFillMode: 'words' | 'dense' | 'stream'
          fillStrategy: 'flow' | 'max'
          exhausted: boolean
          lines: Array<{
            text: string
            x: number
            top: number
            width: number
            slot: { left: number; right: number }
            fillPass?: 1 | 2
          }>
        }
        text: string
        textSize: number
        textWeight: number
        textItalic: boolean
        textColor: string
        autoFillMode: 'words' | 'dense' | 'stream'
        fillStrategy: 'flow' | 'max'
        showShape: boolean
        shapeFill: string
        shapeBorderWidth: number
        shapeBorderColor: string
        shapeShadow: boolean
        svg: string
      }
    }
  }
}

async function getState(page: import('@playwright/test').Page) {
  return page.evaluate(() => window.shapeTextTestApi.getState())
}

async function setRangeValue(
  page: import('@playwright/test').Page,
  selector: string,
  value: string,
) {
  await page.locator(selector).evaluate((element, nextValue) => {
    if (!(element instanceof HTMLInputElement)) {
      throw new Error('Expected an input element')
    }

    element.value = nextValue
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

test('renders the glyph text-mask fixture into SVG', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#stage svg')).toBeVisible()

  const state = await getState(page)

  expect(state.scenario).toBe('glyph-two-repeat')
  expect(state.text).toBe('ONE')
  expect(state.layout.lines.length).toBeGreaterThan(4)
  expect(state.layout.autoFill).toBe(true)
  expect(state.layout.autoFillMode).toBe('words')
  expect(state.layout.fillStrategy).toBe('flow')
  expect(state.layout.exhausted).toBe(false)
  expect(state.layout.lines[0]?.text).toContain('ONE')
  expect(state.textSize).toBe(18)
  const expectedTextNodeCount =
    state.showShape && state.scenario === 'glyph-two-repeat'
      ? state.layout.lines.length + 1
      : state.layout.lines.length
  await expect(page.locator('#stage text')).toHaveCount(expectedTextNodeCount)
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

test('applies text and shape style controls to the rendered SVG', async ({ page }) => {
  await page.goto('/')

  await setRangeValue(page, '#text-size-input', '28')
  await page.locator('#text-weight-select').selectOption('700')
  await page.locator('#text-italic-input').check()
  await page.locator('#text-color-input').fill('#ef4444')
  await page.locator('#shape-fill-input').fill('#fde68a')
  await setRangeValue(page, '#shape-border-width-input', '6')
  await page.locator('#shape-border-color-input').fill('#f59e0b')
  await page.locator('#shape-shadow-input').check()
  await page.locator('#render-button').click()

  const state = await getState(page)

  expect(state.textSize).toBe(28)
  expect(state.textItalic).toBe(true)
  expect(state.shapeBorderWidth).toBe(6)
  expect(state.svg).toContain('font:italic 700 28px')
  expect(state.svg).toContain('fill="#ef4444"')
  expect(state.svg).toContain('stroke="#f59e0b"')
  expect(state.svg).toContain('stroke-width="6"')
  expect(state.svg).toContain('fill="#fde68a"')
  expect(state.svg).toContain('shape-text-shape-shadow')
})

test('packs glyph autofill more tightly in dense mode', async ({ page }) => {
  await page.goto('/')

  const wordsState = await getState(page)

  await page.locator('#auto-fill-mode-select').selectOption('dense')
  await page.locator('#render-button').click()

  const denseState = await getState(page)

  expect(wordsState.layout.autoFillMode).toBe('words')
  expect(denseState.layout.autoFillMode).toBe('dense')
  expect(denseState.autoFillMode).toBe('dense')
  expect(denseState.layout.lines[0]?.text).not.toContain(' ')
  expect(denseState.layout.lines[0]?.width).toBeGreaterThan(wordsState.layout.lines[0]?.width ?? 0)
})

test('keeps spaces and fills multiple slots in max mode without mini-font fallback', async ({ page }) => {
  await page.goto('/')

  await page.locator('#text-input').fill('ONE ONE')
  await page.locator('#auto-fill-mode-select').selectOption('dense')
  await page.locator('#render-button').click()
  const denseState = await getState(page)

  await page.locator('#auto-fill-mode-select').selectOption('max')
  await page.locator('#render-button').click()
  const maxState = await getState(page)

  expect(maxState.fillStrategy).toBe('max')
  expect(maxState.layout.fillStrategy).toBe('max')
  expect(maxState.layout.autoFillMode).toBe('stream')
  expect(maxState.layout.lines.some(line => line.text.includes(' '))).toBe(true)
  expect(maxState.layout.lines.some((line, index, lines) => lines.some(other => other !== line && other.top === line.top))).toBe(true)
  expect(maxState.layout.lines.length).toBeGreaterThanOrEqual(denseState.layout.lines.length)
  expect(maxState.svg).not.toMatch(/font:[^"]*12\./)
})

test('preserves edited glyph autofill text without forcing uppercase', async ({ page }) => {
  await page.goto('/')

  await page.locator('#text-input').fill('one')
  await page.locator('#render-button').click()

  const state = await getState(page)

  await expect(page.locator('#text-input')).toHaveValue('one')
  expect(state.text).toBe('one')
  expect(state.layout.lines[0]?.text).toContain('one')
  expect(state.layout.lines[0]?.text).not.toContain('ONE')
  expect(state.svg).toContain('>one<')
})

test('keeps edited text when switching away from and back to the glyph scenario', async ({
  page,
}) => {
  await page.goto('/')

  await page.locator('#text-input').fill('one')
  await page.locator('#render-button').click()
  await page.evaluate(() => window.shapeTextTestApi.renderScenario('rectangle-wide'))
  await page.evaluate(() => window.shapeTextTestApi.renderScenario('glyph-two-repeat'))

  const state = await getState(page)

  await expect(page.locator('#text-input')).toHaveValue('one')
  expect(state.scenario).toBe('glyph-two-repeat')
  expect(state.text).toBe('one')
  expect(state.layout.lines[0]?.text).toContain('one')
  expect(state.layout.lines[0]?.text).not.toContain('ONE')
})

test('keeps unsaved textarea edits when switching scenarios', async ({ page }) => {
  await page.goto('/')

  await page.locator('#text-input').fill('draft')
  await page.evaluate(() => window.shapeTextTestApi.renderScenario('rectangle-wide'))

  const state = await getState(page)

  await expect(page.locator('#text-input')).toHaveValue('draft')
  expect(state.scenario).toBe('rectangle-wide')
  expect(state.text).toBe('draft')
  expect(state.layout.lines[0]?.text).toContain('draft')
})

test('keeps scenario defaults when rerender changes only style controls', async ({ page }) => {
  await page.goto('/')

  await setRangeValue(page, '#text-size-input', '24')
  await page.locator('#render-button').click()
  await page.evaluate(() => window.shapeTextTestApi.renderScenario('rectangle-wide'))

  const state = await getState(page)

  expect(state.scenario).toBe('rectangle-wide')
  expect(state.text).toContain('Shape text lets a paragraph travel inside a silhouette')
  expect(state.layout.lines[0]?.text).toContain('Shape text')
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
