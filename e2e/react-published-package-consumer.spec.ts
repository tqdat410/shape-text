import { expect, test } from '@playwright/test'

const consumerBaseUrl = `http://127.0.0.1:${Number(process.env.PLAYWRIGHT_CONSUMER_PORT ?? 4175)}`

test('renders the ICT clock and reaching-hand packaged example', async ({ page }) => {
  await page.goto(consumerBaseUrl)

  await expect(page.locator('.showcase-screen')).toHaveCSS('background-image', /radial-gradient/)
  const clockFace = page.locator('.clock-face')
  await expect(clockFace).toBeVisible()
  await expect(page.locator('[aria-live="polite"]')).toHaveAttribute(
    'aria-label',
    /ICT time \d{2}:\d{2}:\d{2}/,
  )
  await expect(clockFace.locator('.clock-glyph')).toHaveCount(8)
  await expect(clockFace.locator('svg')).toHaveCount(8)

  const handArt = page.locator('.hand-art')
  await expect(handArt).toBeVisible()
  await expect(page.locator('[aria-label="Reaching hand SVG mask example"]')).toHaveCount(1)
  await expect(handArt.locator('svg')).toHaveCount(1)
  expect(await handArt.locator('svg text').count()).toBeGreaterThan(0)

  const handBox = await handArt.boundingBox()
  expect(handBox?.width ?? 0).toBeGreaterThan(360)
  expect(handBox?.height ?? 0).toBeGreaterThan(260)
})
