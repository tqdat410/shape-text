import { expect, test } from '@playwright/test'

function readNumber(value: string) {
  return Number(value.trim())
}

test('renders the value-derived shape paragraph by default', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Shape paragraph workbench' })).toBeVisible()
  await expect(page.getByTestId('stage').locator('svg')).toBeVisible()
  await expect(page.getByLabel('Shape source')).toHaveValue('value-derived')
  await expect(page.getByLabel('Shape value')).toHaveValue('23')
  await expect(page.getByTestId('summary-shape-source')).toHaveText('value-derived')
  await expect(page.getByLabel('Fill mode')).toHaveCount(0)
  await expect(page.locator('option[value="500"]')).toHaveCount(0)

  expect(readNumber(await page.getByTestId('summary-line-count').innerText())).toBeGreaterThan(0)
})

test('switches between value-derived and geometry shape sources', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Shape source').selectOption('geometry')
  await expect(page.getByLabel('Geometry preset')).toHaveValue('digit-two')
  await expect(page.getByTestId('summary-shape-source')).toHaveText('geometry')
  await expect(page.getByLabel('Shape value')).toHaveCount(0)

  await page.getByLabel('Geometry preset').selectOption('rectangle-wide')
  await expect(page.getByTestId('stage').locator('svg')).toBeVisible()

  await page.getByLabel('Shape source').selectOption('value-derived')
  await expect(page.getByLabel('Shape value')).toHaveValue('23')
  await expect(page.getByTestId('summary-shape-source')).toHaveText('value-derived')
})

test('switches text-mask sizing between fit-content and fixed', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Shape size mode').selectOption('fixed')
  await page.getByLabel('Fixed width').fill('520')
  await page.getByLabel('Fixed height').fill('260')
  await expect(page.getByTestId('summary-shape-size')).toHaveText('520 × 260')

  await page.getByLabel('Shape size mode').selectOption('fit-content')
  await expect(page.getByTestId('summary-shape-size')).not.toHaveText('520 × 260')
})

test('switches value-derived rendering between whole-text and per-character regions', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Paragraph text').fill('ABCDEFGHIJ')
  await page.getByLabel('Shape value').fill('AB')
  await page.getByLabel('Shape size mode').selectOption('fixed')
  await page.getByLabel('Fixed width').fill('520')
  await page.getByLabel('Fixed height').fill('260')
  await expect(page.getByTestId('summary-region-count')).toHaveText('0')

  await page.getByLabel('Shape text mode').selectOption('per-character')
  await expect(page.getByTestId('summary-region-count')).toHaveText('2')
  expect(readNumber(await page.getByTestId('summary-line-count').innerText())).toBeGreaterThan(0)
})

test('rerolls true-random preset text while keeping the same preset family selected', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Fill preset').selectOption('ascii-random')
  const firstText = await page.getByLabel('Paragraph text').inputValue()

  await expect(page.getByLabel('Fill preset')).toHaveValue('ascii-random')
  await page.getByRole('button', { name: 'Reroll' }).click()
  const secondText = await page.getByLabel('Paragraph text').inputValue()

  expect(firstText).not.toBe(secondText)
  expect(firstText).toMatch(/^[A-Za-z0-9!@#$%^&*()[\]{}<>?/|+\-=]+$/)
  expect(secondText).toMatch(/^[A-Za-z0-9!@#$%^&*()[\]{}<>?/|+\-=]+$/)
})
