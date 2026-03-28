// @ts-check
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { startStaticServer } from './static-server.js';

const viewportWidth = 1440;
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
  const jsErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (error) => {
    jsErrors.push(error.message);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  return { response, jsErrors, consoleErrors };
}

test.describe('homepage smoke and links', () => {
  test('page loads and key content is visible', async ({ page }) => {
    const { response, jsErrors, consoleErrors } = await openHome(page);

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole('heading', { level: 1, name: /Denis Matveev/i })).toBeVisible();
    await expect(page.getByText(/Product & UX\/UI Designer/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resume' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(page.getByText('Updated portfolio is coming soon…')).toBeVisible();

    expect(jsErrors).toEqual([]);
    expect(
      consoleErrors.filter((message) => !message.includes('Cookie “_clck” has been rejected for invalid domain.')),
    ).toEqual([]);

    await expect(page.locator('script[src*="clarity.ms/tag/"]')).toHaveCount(1);
    await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
  });

  test('links and actions work as expected', async ({ page }) => {
    await openHome(page);

    const resume = page.getByRole('link', { name: 'Resume' });
    await expect(resume).toHaveAttribute('href', 'assets/CV_Denis_Matveev.pdf');
    await expect(resume).toHaveAttribute('download', '');

    const portfolio = page.getByRole('link', { name: 'Portfolio' });
    await expect(portfolio).toHaveAttribute('href', 'https://www.behance.net/denmatveev');
    await expect(portfolio).toHaveAttribute('target', '_blank');
    await expect(portfolio).toHaveAttribute('rel', /noreferrer/);

    const contact = page.getByRole('link', { name: 'Contact' });
    await expect(contact).toHaveAttribute('href', 'mailto:denis.vic.matveev@gmail.com');
  });
});

test.describe('homepage assets and accessibility', () => {
  test('static assets and icons are reachable', async ({ page }) => {
    const requests = [];
    page.on('request', (request) => {
      requests.push(request.url());
    });

    await openHome(page);

    const expectedResources = [
      '/styles.css',
      '/assets/hero-back.svg',
      '/assets/portrait.png',
      '/assets/behance.svg',
    ].map((assetPath) => new URL(assetPath, baseUrl).href);

    for (const resourceUrl of expectedResources) {
      expect(requests).toContain(resourceUrl);
    }

    for (const assetPath of ['favicon.svg', 'favicon.png', 'apple-touch-icon.png']) {
      expect(existsSync(resolve(process.cwd(), assetPath)), assetPath).toBeTruthy();
    }
  });

  test('accessible navigation and structure stay intact', async ({ page }) => {
    await openHome(page);

    await expect(page.locator('h1')).toHaveCount(1);

    const resume = page.getByRole('link', { name: 'Resume' });
    const portfolio = page.getByRole('link', { name: 'Portfolio' });
    const contact = page.getByRole('link', { name: 'Contact' });

    await resume.focus();
    await expect(resume).toBeFocused();

    if (page.context().browser()?.browserType().name() !== 'webkit') {
      await page.keyboard.press('Tab');
      await expect(portfolio).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(contact).toBeFocused();
    }

    await expect(page.locator('img[alt=""]')).toHaveCount(3);

    const axeResults = await new AxeBuilder({ page }).analyze();
    expect(axeResults.violations).toEqual([]);
  });
});

test.describe('homepage analytics and responsive layout', () => {
  test('desktop layout does not overflow', async ({ page }) => {
    await page.setViewportSize({ width: viewportWidth, height: 1024 });
    await openHome(page);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);

    await expect(page.locator('.hero-portfolio__inner')).toBeVisible();
  });

  test('mobile layout keeps actions separated and avoids horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    const boxes = await page.locator('.hero-action').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }),
    );

    for (let index = 0; index < boxes.length; index += 1) {
      for (let next = index + 1; next < boxes.length; next += 1) {
        const first = boxes[index];
        const second = boxes[next];
        const overlaps =
          first.left < second.right &&
          first.right > second.left &&
          first.top < second.bottom &&
          first.bottom > second.top;

        expect(overlaps, `buttons ${index} and ${next} overlap`).toBeFalsy();
      }
    }
  });
});
