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
          compiledShape?: {
            bounds: {
              left: number
              top: number
              right: number
              bottom: number
            }
            regions?: Array<{ grapheme: string }>
          }
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
        fillPresetId: string
        textSize: number
        textWeight: number
        textItalic: boolean
        textColor: string
        autoFillMode: 'words' | 'dense' | 'stream'
        fillStrategy: 'flow' | 'max'
        shapeKind: 'polygon' | 'text-mask'
        shapeText: string
        shapeTextMode: 'whole-text' | 'per-character'
        shapeSizeMode: 'fit-content' | 'fixed'
        showShape: boolean
        shapeFill: string
        shapeBorderWidth: number
        shapeBorderColor: string
        shapeShadow: boolean
        stageZoom: number
        stageSvgWidth: number
        stageSvgHeight: number
        payloadDraft: string
        payloadError: string
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
  expect(state.shapeText).toBe('23')
  expect(state.shapeSizeMode).toBe('fit-content')
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

test('lets the demo edit glyph shape text directly', async ({ page }) => {
  await page.goto('/')

  await page.locator('#shape-text-input').fill('8')
  await page.locator('#render-button').click()

  const state = await getState(page)

  await expect(page.locator('#shape-text-input')).toHaveValue('8')
  expect(state.shapeKind).toBe('text-mask')
  expect(state.shapeText).toBe('8')
  expect(state.svg).toContain('>8<')
})

test('restores the last good state when direct render controls produce an invalid shape', async ({
  page,
}) => {
  await page.goto('/')

  const before = await getState(page)
  await page.locator('#shape-text-input').fill('')
  await page.locator('#render-button').click()

  const after = await getState(page)

  await expect(page.locator('#shape-text-input')).toHaveValue(before.shapeText)
  expect(after.shapeText).toBe(before.shapeText)
  expect(after.svg).toBe(before.svg)
  expect(after.payloadError.length).toBeGreaterThan(0)
})

test('keeps wide output inspectable inside the zoomable stage viewport', async ({ page }) => {
  await page.goto('/')

  const initialState = await getState(page)
  const initialWidth =
    (initialState.layout.compiledShape?.bounds.right ?? 0) -
    (initialState.layout.compiledShape?.bounds.left ?? 0)
  const payload = JSON.parse(await page.locator('#payload-input').inputValue())
  payload.layout.shape.text = '20252025'
  payload.layout.shape.shapeTextMode = 'whole-text'

  await page.locator('#payload-input').fill(JSON.stringify(payload, null, 2))
  await page.locator('#apply-payload-button').click()

  const beforeZoom = await getState(page)
  const widenedShapeWidth =
    (beforeZoom.layout.compiledShape?.bounds.right ?? 0) -
    (beforeZoom.layout.compiledShape?.bounds.left ?? 0)
  const viewportMetrics = await page.locator('#stage-viewport').evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))

  await page.locator('#zoom-in-button').click()
  const zoomedIn = await getState(page)
  await page.locator('#zoom-out-button').click()
  const zoomedOut = await getState(page)
  await page.locator('#zoom-fit-button').click()
  const fitState = await getState(page)
  const fitViewportMetrics = await page.locator('#stage-viewport').evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  await page.locator('#zoom-reset-button').click()
  const resetState = await getState(page)

  expect(widenedShapeWidth).toBeGreaterThan(initialWidth)
  expect(viewportMetrics.scrollWidth).toBeGreaterThan(viewportMetrics.clientWidth)
  expect(zoomedIn.stageZoom).toBeGreaterThan(beforeZoom.stageZoom)
  expect(zoomedOut.stageZoom).toBeLessThan(zoomedIn.stageZoom)
  expect(fitState.stageZoom).toBeGreaterThan(0)
  expect(fitViewportMetrics.scrollWidth).toBeLessThanOrEqual(fitViewportMetrics.clientWidth + 12)
  expect(resetState.stageZoom).toBe(1)
  await expect(page.locator('#stage svg')).toBeVisible()
})

test('applies payload editor changes to the live demo state', async ({ page }) => {
  await page.goto('/')

  const payload = JSON.parse(await page.locator('#payload-input').inputValue())
  payload.layout.text = 'DATA'
  payload.layout.textStyle.size = 30
  payload.layout.shape.text = '8'

  await page.locator('#payload-input').fill(JSON.stringify(payload, null, 2))
  await page.locator('#apply-payload-button').click()

  const state = await getState(page)

  expect(state.text).toBe('DATA')
  expect(state.textSize).toBe(30)
  expect(state.shapeText).toBe('8')
  expect(state.payloadError).toBe('')
  expect(state.svg).toContain('font:normal 700 30px')
  expect(state.svg).toContain('>8<')
})

test('switches text-mask sizing between fit-content and fixed', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#shape-fixed-width-field')).toBeHidden()
  await expect(page.locator('#shape-fixed-height-field')).toBeHidden()

  await page.locator('#shape-size-mode-select').selectOption('fixed')
  await expect(page.locator('#shape-fixed-width-field')).toBeVisible()
  await expect(page.locator('#shape-fixed-height-field')).toBeVisible()

  await page.locator('#shape-fixed-width-input').fill('520')
  await page.locator('#shape-fixed-height-input').fill('260')
  await page.locator('#render-button').click()

  const fixedState = await getState(page)
  const fixedWidth =
    (fixedState.layout.compiledShape?.bounds.right ?? 0) -
    (fixedState.layout.compiledShape?.bounds.left ?? 0)

  expect(fixedState.shapeSizeMode).toBe('fixed')
  expect(fixedWidth).toBe(520)
  expect(fixedState.payloadDraft).toContain('"mode": "fixed"')

  await page.locator('#shape-size-mode-select').selectOption('fit-content')
  await page.locator('#render-button').click()
  await expect(page.locator('#shape-fixed-width-field')).toBeHidden()
  await expect(page.locator('#shape-fixed-height-field')).toBeHidden()

  const fitState = await getState(page)
  const fitWidth =
    (fitState.layout.compiledShape?.bounds.right ?? 0) -
    (fitState.layout.compiledShape?.bounds.left ?? 0)

  expect(fitState.shapeSizeMode).toBe('fit-content')
  expect(fitState.payloadDraft).toContain('"mode": "fit-content"')
  expect(fitWidth).toBeLessThan(fixedWidth)
})

test('switches text-mask rendering between whole-text and per-character regions', async ({
  page,
}) => {
  await page.goto('/')

  const payload = JSON.parse(await page.locator('#payload-input').inputValue())
  payload.layout.autoFill = false
  payload.layout.text = 'ABCDEFGHIJ'
  payload.layout.lineHeight = 18
  payload.layout.minSlotWidth = 1
  payload.layout.textStyle.size = 14
  payload.layout.shape.text = 'AB'
  payload.layout.shape.font = '700 260px Arial'
  payload.layout.shape.size = {
    mode: 'fixed',
    width: 520,
    height: 260,
  }
  payload.layout.shape.shapeTextMode = 'whole-text'

  await page.locator('#payload-input').fill(JSON.stringify(payload, null, 2))
  await page.locator('#apply-payload-button').click()
  const wholeTextState = await getState(page)

  await page.locator('#shape-text-mode-select').selectOption('per-character')
  await page.locator('#render-button').click()
  const perCharacterState = await getState(page)

  expect(wholeTextState.shapeTextMode).toBe('whole-text')
  expect(perCharacterState.shapeTextMode).toBe('per-character')
  expect(perCharacterState.payloadDraft).toContain('"shapeTextMode": "per-character"')
  expect(wholeTextState.layout.compiledShape?.regions ?? []).toHaveLength(0)
  expect(perCharacterState.layout.compiledShape?.regions?.map(region => region.grapheme)).toEqual(['A', 'B'])
  expect(perCharacterState.layout.lines.length).toBeGreaterThan(0)
})

test('keeps the last successful SVG when payload parsing fails', async ({ page }) => {
  await page.goto('/')

  const before = await getState(page)
  await page.locator('#payload-input').fill('{"layout":')
  await page.locator('#apply-payload-button').click()

  const after = await getState(page)

  expect(after.payloadError.length).toBeGreaterThan(0)
  expect(after.svg).toBe(before.svg)
  expect(after.text).toBe(before.text)
  expect(after.shapeText).toBe(before.shapeText)
  await expect(page.locator('#payload-error')).toBeVisible()
})

test('keeps state unchanged when payload validation fails mid-apply', async ({ page }) => {
  await page.goto('/')

  const before = await getState(page)
  const payload = JSON.parse(await page.locator('#payload-input').inputValue())
  payload.layout.text = 'BROKEN'
  payload.layout.shape.text = '8'
  payload.render.padding = 'oops'

  await page.locator('#payload-input').fill(JSON.stringify(payload, null, 2))
  await page.locator('#apply-payload-button').click()

  const after = await getState(page)

  expect(after.payloadError).toContain('render.padding')
  expect(after.text).toBe(before.text)
  expect(after.shapeText).toBe(before.shapeText)
  expect(after.svg).toBe(before.svg)
})

test('keeps state unchanged when payload render fails after JSON parsing succeeds', async ({
  page,
}) => {
  await page.goto('/')

  const before = await getState(page)
  const payload = JSON.parse(await page.locator('#payload-input').inputValue())
  payload.layout.text = 'BROKEN-BUT-VALID'
  payload.layout.shape.text = ''

  await page.locator('#payload-input').fill(JSON.stringify(payload, null, 2))
  await page.locator('#apply-payload-button').click()

  const after = await getState(page)

  expect(after.payloadError.length).toBeGreaterThan(0)
  expect(after.text).toBe(before.text)
  expect(after.shapeText).toBe(before.shapeText)
  expect(after.svg).toBe(before.svg)
})

test('preserves omitted payload fields instead of resetting styling and fill mode', async ({
  page,
}) => {
  await page.goto('/')

  await page.locator('#text-italic-input').check()
  await page.locator('#auto-fill-mode-select').selectOption('max')
  await page.locator('#render-button').click()

  const payload = JSON.parse(await page.locator('#payload-input').inputValue())
  delete payload.layout.fillStrategy
  delete payload.layout.autoFillMode
  payload.layout.textStyle = { size: 22 }

  await page.locator('#payload-input').fill(JSON.stringify(payload, null, 2))
  await page.locator('#apply-payload-button').click()

  const state = await getState(page)

  expect(state.textSize).toBe(22)
  expect(state.textItalic).toBe(true)
  expect(state.fillStrategy).toBe('max')
  expect(state.autoFillMode).toBe('stream')
})

test('keeps payloadDraft aligned with the visible textarea while draft edits are dirty', async ({
  page,
}) => {
  await page.goto('/')

  const payload = JSON.parse(await page.locator('#payload-input').inputValue())
  payload.layout.text = 'DIRTY'
  const dirtyDraft = JSON.stringify(payload, null, 2)

  await page.locator('#payload-input').fill(dirtyDraft)
  await setRangeValue(page, '#text-size-input', '24')

  const state = await getState(page)

  expect(state.payloadDraft).toBe(await page.locator('#payload-input').inputValue())
  expect(state.payloadDraft).toBe(dirtyDraft)
})

test('syncs predefined fill presets into text input and payload draft', async ({ page }) => {
  await page.goto('/')

  await page.locator('#fill-preset-select').selectOption('binary-random')

  const state = await getState(page)

  await expect(page.locator('#text-input')).toHaveValue(state.text)
  expect(state.fillPresetId).toBe('binary-random')
  expect(state.text).toMatch(/^[01]+$/)
  expect(state.text.length).toBeGreaterThan(100)
  expect(state.payloadDraft).toContain(`"text": "${state.text}"`)
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
