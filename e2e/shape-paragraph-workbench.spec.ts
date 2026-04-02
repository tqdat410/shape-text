import { expect, test } from '@playwright/test'

test('applies payload JSON and keeps the last successful SVG when JSON is invalid', async ({ page }) => {
  await page.goto('/')

  await page.getByText('Advanced payload editor').click()
  await page.getByLabel('Payload JSON').fill(
    JSON.stringify(
      {
        layout: {
          text: 'DATA FLOW',
          textStyle: {
            family: '"Helvetica Neue", Arial, sans-serif',
            size: 22,
            weight: 700,
            style: 'normal',
            color: '#0f172a',
          },
          lineHeight: 28,
          shape: {
            kind: 'text-mask',
            text: '8',
            font: '700 420px Arial',
            size: { mode: 'fit-content', padding: 10 },
            shapeTextMode: 'whole-text',
            maskScale: 2,
          },
          autoFill: true,
        },
        render: {
          background: '#f8fafc',
          padding: 16,
          showShape: true,
          shapeStyle: {
            backgroundColor: '#dbeafe',
            borderColor: '#94a3b8',
            borderWidth: 2,
          },
        },
      },
      null,
      2,
    ),
  )
  await page.getByRole('button', { name: 'Apply JSON' }).click()

  await expect(page.getByLabel('Paragraph text')).toHaveValue('DATA FLOW')
  await expect(page.getByLabel('Shape value')).toHaveValue('8')
  await expect(page.getByTestId('stage').locator('svg')).toBeVisible()

  const beforeMarkup = await page.getByTestId('stage').innerHTML()
  await page.getByLabel('Payload JSON').fill('{"layout":')
  await page.getByRole('button', { name: 'Apply JSON' }).click()

  await expect(page.getByTestId('payload-error')).toBeVisible()
  await expect(page.getByTestId('stage').locator('svg')).toBeVisible()
  expect(await page.getByTestId('stage').innerHTML()).toBe(beforeMarkup)
})

test('merges partial payload JSON without resetting omitted state', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Italic').check()
  await page.getByText('Advanced payload editor').click()
  await page.getByLabel('Payload JSON').fill(
    JSON.stringify(
      {
        layout: {
          textStyle: {
            size: 30,
          },
        },
        render: {},
      },
      null,
      2,
    ),
  )
  await page.getByRole('button', { name: 'Apply JSON' }).click()

  await expect(page.getByLabel('Text size')).toHaveValue('30')
  await expect(page.getByLabel('Italic')).toBeChecked()
  await expect(page.getByLabel('Auto fill')).toBeChecked()
})

test('keeps custom geometry payloads labeled as custom instead of overwriting them with a preset', async ({ page }) => {
  await page.goto('/')

  await page.getByText('Advanced payload editor').click()
  await page.getByLabel('Payload JSON').fill(
    JSON.stringify(
      {
        layout: {
          shape: {
            kind: 'polygon',
            points: [
              { x: 0, y: 0 },
              { x: 200, y: 0 },
              { x: 120, y: 220 },
            ],
          },
        },
        render: {},
      },
      null,
      2,
    ),
  )
  await page.getByRole('button', { name: 'Apply JSON' }).click()

  await expect(page.getByLabel('Shape source')).toHaveValue('geometry')
  await expect(page.getByLabel('Geometry preset')).toHaveValue('custom')
})

test('keeps wide output inspectable with zoom controls', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Shape value').fill('202520252025202520252025')
  await expect(page.getByTestId('stage').locator('svg')).toBeVisible()

  await page.getByRole('button', { name: '100%' }).click()
  const viewportBefore = await page.getByTestId('stage-viewport').evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))

  await expect(page.getByTestId('stage-zoom')).toHaveText('100%')
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(page.getByTestId('stage-zoom')).not.toHaveText('100%')
  await page.getByRole('button', { name: 'Fit' }).click()

  const viewportAfter = await page.getByTestId('stage-viewport').evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))

  expect(viewportBefore.scrollWidth).toBeGreaterThanOrEqual(viewportBefore.clientWidth)
  expect(viewportAfter.scrollWidth).toBeLessThanOrEqual(viewportAfter.clientWidth + 12)
})

test('fits tall output by viewport height as well as width', async ({ page }) => {
  await page.goto('/')

  await page.getByText('Advanced payload editor').click()
  await page.getByLabel('Payload JSON').fill(
    JSON.stringify(
      {
        layout: {
          shape: {
            kind: 'polygon',
            points: [
              { x: 0, y: 0 },
              { x: 220, y: 0 },
              { x: 220, y: 1500 },
              { x: 0, y: 1500 },
            ],
          },
        },
        render: {},
      },
      null,
      2,
    ),
  )
  await page.getByRole('button', { name: 'Apply JSON' }).click()
  await page.getByRole('button', { name: 'Fit' }).click()

  const viewportAfter = await page.getByTestId('stage-viewport').evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))

  await expect(page.getByTestId('stage-zoom')).not.toHaveText('100%')
  expect(viewportAfter.scrollHeight).toBeLessThanOrEqual(viewportAfter.clientHeight + 12)
})
