// @ts-check
import { test, expect } from '@playwright/test';
import { startStaticServer } from './static-server.js';

let baseUrl;
let closeServer;

test.beforeAll(async () => {
  const server = await startStaticServer();
  baseUrl = server.baseUrl;
  closeServer = server.close;
});

test.afterAll(async () => {
  await closeServer?.();
});

async function openHome(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.home-main').waitFor();
}

test.describe('homepage visual regression', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Visual baselines are kept on Chromium only.');

  test('desktop screenshot matches the baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await openHome(page);

    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('mobile screenshot matches the baseline', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });
});
