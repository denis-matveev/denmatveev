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

async function readAnalyticsEvents(page, eventNames) {
  return page.evaluate(
    (names) =>
      window.dataLayer
        .map((entry) => Array.from(entry))
        .filter((entry) => entry[0] === 'event' && names.includes(entry[1]))
        .map((entry) => ({
          name: entry[1],
          params: entry[2],
        })),
    eventNames,
  );
}

test.describe('homepage smoke and links', () => {
  test('page loads and key content is visible', async ({ page }) => {
    const { response, jsErrors, consoleErrors } = await openHome(page);

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole('heading', { level: 1, name: /Denis Matveev/i })).toBeVisible();
    await expect(page.getByText(/product designer with 10\+ years/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resume', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'More archive work on Behance' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();
    await expect(page.getByText(/Lakku\.ai — Building an AI marketing platform/i)).toBeVisible();
    await expect(page.getByText(/CrossCom — Modernizing an internal company network/i)).toBeVisible();

    expect(jsErrors).toEqual([]);
    expect(
      consoleErrors.filter((message) => !message.includes('Cookie “_clck” has been rejected for invalid domain.')),
    ).toEqual([]);

    await expect(page.locator('script[src*="clarity.ms/tag/"]')).toHaveCount(1);
    await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveCount(1);
  });

  test('links and actions work as expected', async ({ page }) => {
    await openHome(page);

    const resume = page.getByRole('link', { name: 'Resume', exact: true });
    await expect(resume).toHaveAttribute('href', 'assets/CV_Denis_Matveev.pdf');
    await expect(resume).toHaveAttribute('download', '');

    const portfolio = page.getByRole('link', { name: 'More archive work on Behance' });
    await expect(portfolio).toHaveAttribute('href', 'https://www.behance.net/denmatveev');
    await expect(portfolio).toHaveAttribute('target', '_blank');
    await expect(portfolio).toHaveAttribute('rel', /noreferrer/);

    const contact = page.getByRole('link', { name: 'Contact', exact: true });
    await expect(contact).toHaveAttribute('href', 'mailto:denis.vic.matveev@gmail.com');

    const logo = page.getByRole('link', { name: 'Denis Matveev — home' });
    await expect(logo).toHaveAttribute('href', '/');

    const linkedIn = page.getByRole('link', { name: 'LinkedIn' });
    await expect(linkedIn).toHaveAttribute('href', 'https://www.linkedin.com/in/denmatveev/');
    await expect(linkedIn).toHaveAttribute('target', '_blank');
    await expect(linkedIn).toHaveAttribute('rel', /noreferrer/);

    const lakkuCase = page.getByRole('link', { name: 'Read the Lakku.ai case study' });
    await expect(lakkuCase).toHaveAttribute('href', 'lakku.html');

    const crossComCase = page.getByRole('link', { name: 'Read the CrossCom case study' });
    await expect(crossComCase).toHaveAttribute('href', 'crosscom.html');
  });

  test('menu items match the Figma selected, hover and pressed states', async ({ page }) => {
    await openHome(page);

    const selected = page.locator('.nav-item--active > .nav-item__label');
    const selectedItem = page.locator('.nav-item--active');
    const resume = page.getByRole('link', { name: 'Resume', exact: true });

    await expect
      .poll(() =>
        selected.evaluate((element) => {
          const indicator = window.getComputedStyle(element, '::after');
          return {
            backgroundColor: indicator.backgroundColor,
            height: indicator.height,
          };
        }),
      )
      .toEqual({
        backgroundColor: 'rgb(52, 110, 23)',
        height: '2px',
      });

    await resume.hover();
    await expect
      .poll(() => resume.evaluate((element) => window.getComputedStyle(element).backgroundColor))
      .toBe('rgb(246, 246, 245)');

    await selectedItem.hover();
    await expect
      .poll(() => selectedItem.evaluate((element) => window.getComputedStyle(element).backgroundColor))
      .toBe('rgb(246, 246, 245)');

    const box = await resume.boundingBox();
    if (!box) {
      throw new Error('Resume menu item is not visible');
    }

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect
      .poll(() => resume.evaluate((element) => window.getComputedStyle(element).backgroundColor))
      .toBe('rgb(255, 255, 255)');
    await page.mouse.up();
  });

  test('container shallow uses the dark theme surface', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await openHome(page);

    const archive = page.getByRole('link', { name: 'More archive work on Behance' });
    await expect
      .poll(() => archive.evaluate((element) => window.getComputedStyle(element).backgroundColor))
      .toBe('rgb(51, 51, 49)');

    await expect
      .poll(() =>
        page
          .locator('.nav-item__icon--file')
          .evaluate((element) => window.getComputedStyle(element).backgroundColor),
      )
      .toBe('rgb(53, 210, 0)');

    await expect
      .poll(() =>
        page
          .locator('.archive-link__icon')
          .evaluate((element) => window.getComputedStyle(element).backgroundColor),
      )
      .toBe('rgb(255, 255, 255)');

    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect
      .poll(() =>
        page
          .locator('#primary-navigation')
          .evaluate((element) => window.getComputedStyle(element).boxShadow),
      )
      .toBe('none');
  });
});

test.describe('Lakku case study', () => {
  test('desktop page matches the main Figma geometry and loads its content', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    const response = await page.goto(new URL('/lakku.html', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1, name: 'Lakku.ai' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Outcome' })).toBeAttached();
    await expect(page.getByRole('link', { name: 'Download on Google Play' })).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=id.dashku.lakku',
    );

    const geometry = await page.evaluate(() => {
      const rect = (selector) => {
        const bounds = document.querySelector(selector).getBoundingClientRect();
        return { width: bounds.width, height: bounds.height };
      };

      return {
        scrollWidth: document.documentElement.scrollWidth,
        main: rect('.case-main'),
        header: rect('.case-header'),
        hero: rect('.case-hero-image'),
        summary: rect('.case-summary'),
        stripTextAlignment: (() => {
          const text = document.querySelector('.case-content > p');
          const image = document.querySelector('.case-mockups--strip img');
          return image.getBoundingClientRect().left - text.getBoundingClientRect().left;
        })(),
        stripRightEdge:
          window.innerWidth -
          document.querySelector('.case-mockups--strip').getBoundingClientRect().right,
        stripLeftEdge: document
          .querySelector('.case-mockups--strip')
          .getBoundingClientRect().left,
        stripShadowRoom: (() => {
          const strip = document.querySelector('.case-mockups--strip');
          const viewport = strip.querySelector('.case-mockups__viewport');
          const image = strip.querySelector('img');
          return viewport.getBoundingClientRect().bottom - image.getBoundingClientRect().bottom;
        })(),
      };
    });

    expect(geometry.scrollWidth).toBe(1400);
    expect(geometry.main.width).toBe(1200);
    expect(geometry.header.height).toBe(1081);
    expect(geometry.hero).toEqual({ width: 1200, height: 543 });
    expect(geometry.summary).toEqual({ width: 760, height: 255 });
    expect(geometry.stripTextAlignment).toBe(0);
    expect(geometry.stripRightEdge).toBe(0);
    expect(geometry.stripLeftEdge).toBe(0);
    expect(geometry.stripShadowRoom).toBe(36);
    await expect(page.locator('.screen-mockup img')).toHaveCount(35);
  });

  test('mockup presentations scroll locally and expose arrow navigation when needed', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(new URL('/lakku.html', baseUrl).href, { waitUntil: 'domcontentloaded' });

    const presentation = page.locator('.case-mockups').nth(1);
    const viewport = presentation.locator('.case-mockups__viewport');
    const previous = presentation.getByRole('button', { name: 'Show previous mockups' });
    const next = presentation.getByRole('button', { name: 'Show next mockups' });

    await expect(viewport).toHaveAttribute('role', 'region');
    await expect(viewport).toHaveCSS('overflow-x', 'auto');
    await expect(next).toBeVisible();
    await expect(next).toHaveCSS('opacity', '0');
    await expect(previous).toBeHidden();
    await expect(next).toHaveCSS('width', '40px');
    await expect(next).toHaveCSS('height', '40px');
    await expect(next.locator('.case-mockups__arrow-icon')).toHaveCSS('width', '24px');

    const dimensions = await viewport.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      scrollLeft: element.scrollLeft,
    }));

    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
    await next.click({ force: true });
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await expect(previous).toBeVisible();
    await expect(previous).toBeFocused();
  });

  test('the final mockup aligns with the right edge of the text column', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto(new URL('/lakku.html', baseUrl).href, { waitUntil: 'domcontentloaded' });

    const presentation = page.locator('.case-mockups--strip').first();
    const viewport = presentation.locator('.case-mockups__viewport');

    await viewport.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });

    const alignment = await presentation.evaluate((element) => {
      const text = document.querySelector('.case-content > p');
      const mockups = element.querySelectorAll('img');
      const lastMockup = mockups[mockups.length - 1];

      return lastMockup.getBoundingClientRect().right - text.getBoundingClientRect().right;
    });

    expect(alignment).toBe(0);
  });

  test('case study adapts without page-level horizontal scrolling', async ({ page }) => {
    for (const viewport of [
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
      { width: 320, height: 700 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(new URL('/lakku.html', baseUrl).href, {
        waitUntil: 'domcontentloaded',
      });

      const geometry = await page.evaluate(() => {
        const bounds = (selector) => {
          const rect = document.querySelector(selector).getBoundingClientRect();
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        };
        const firstPresentation = document.querySelector('.case-mockups');
        const viewportElement = firstPresentation.querySelector('.case-mockups__viewport');

        return {
          pageWidth: document.documentElement.scrollWidth,
          main: bounds('.case-main'),
          hero: bounds('.case-hero-image'),
          summary: bounds('.case-summary'),
          text: bounds('.case-content > p'),
          firstMockup: bounds('.case-mockups img'),
          mockupOverflow: viewportElement.scrollWidth > viewportElement.clientWidth,
          arrowDisplay: window.getComputedStyle(
            firstPresentation.querySelector('.case-mockups__arrow'),
          ).display,
        };
      });

      expect(geometry.pageWidth).toBe(viewport.width);
      expect(geometry.main.width).toBe(viewport.width);
      expect(geometry.hero.left).toBeGreaterThanOrEqual(16);
      expect(geometry.hero.right).toBeLessThanOrEqual(viewport.width - 16);
      expect(geometry.summary.left).toBe(geometry.hero.left);
      expect(geometry.summary.right).toBe(geometry.hero.right);
      expect(geometry.text.width).toBeLessThanOrEqual(680);
      expect(geometry.firstMockup.left).toBe(geometry.text.left);
      expect(geometry.mockupOverflow).toBe(true);
      if (viewport.width <= 640) {
        expect(geometry.arrowDisplay).toBe('none');
      }
    }
  });

  test('mobile viewer handles media and keeps each mockup presentation in its own gallery', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(new URL('/lakku.html', baseUrl).href, { waitUntil: 'domcontentloaded' });

    const mediaImages = page.locator('.case-media img');
    const mockupImage = page.locator('.screen-mockup img').first();
    const viewer = page.getByRole('dialog', { name: 'Image viewer' });

    await expect(mediaImages).toHaveCount(5);
    await expect(mediaImages.first()).toHaveAttribute('role', 'button');
    await expect(mockupImage).toHaveAttribute('role', 'button');

    await mediaImages.first().click();
    await expect(viewer).toBeVisible();
    await expect(viewer.locator('.media-viewer__position')).toHaveText('1 / 5');

    const viewerIconAssets = await viewer.locator('.media-viewer__icon').evaluateAll((icons) =>
      icons.map((icon) => window.getComputedStyle(icon).maskImage),
    );
    expect(viewerIconAssets).toEqual([
      expect.stringContaining('/assets/icons/untitled-ui/minus.svg'),
      expect.stringContaining('/assets/icons/untitled-ui/plus.svg'),
      expect.stringContaining('/assets/icons/untitled-ui/x-close.svg'),
      expect.stringContaining('/assets/icons/untitled-ui/arrow-left.svg'),
      expect.stringContaining('/assets/icons/untitled-ui/arrow-right.svg'),
    ]);

    await viewer.getByRole('button', { name: 'Zoom in' }).click();
    await expect(viewer.locator('.media-viewer__zoom-value')).toHaveText('150%');
    await viewer.getByRole('button', { name: 'Zoom out' }).click();

    const imageBox = await viewer.locator('.media-viewer__image').boundingBox();
    if (!imageBox) {
      throw new Error('Viewer image is not visible');
    }
    await page.mouse.move(imageBox.x + imageBox.width * 0.75, imageBox.y + imageBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(imageBox.x + imageBox.width * 0.25, imageBox.y + imageBox.height / 2);
    await page.mouse.up();
    await expect(viewer.locator('.media-viewer__position')).toHaveText('2 / 5');

    await viewer.locator('.media-viewer__stage').click({ position: { x: 4, y: 4 } });
    await expect(viewer).toBeHidden();

    await mediaImages.first().click();
    const dismissImageBox = await viewer.locator('.media-viewer__image').boundingBox();
    if (!dismissImageBox) {
      throw new Error('Viewer image is not visible for dismiss gesture');
    }
    await page.mouse.move(
      dismissImageBox.x + dismissImageBox.width / 2,
      dismissImageBox.y + dismissImageBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      dismissImageBox.x + dismissImageBox.width / 2,
      dismissImageBox.y + dismissImageBox.height / 2 + 120,
    );
    await page.mouse.up();
    await expect(viewer).toBeHidden();

    await mediaImages.first().click();
    await viewer.getByRole('button', { name: 'Close image viewer' }).click();
    await expect(viewer).toBeHidden();

    await mockupImage.click();
    await expect(viewer).toBeVisible();
    await expect(viewer.locator('.media-viewer__caption')).toHaveText('Product');
    await expect(viewer.locator('.media-viewer__position')).toHaveText('1 / 3');
    await viewer.getByRole('button', { name: 'Next image' }).click();
    await viewer.getByRole('button', { name: 'Next image' }).click();
    await expect(viewer.locator('.media-viewer__position')).toHaveText('3 / 3');
    await expect(viewer.getByRole('button', { name: 'Next image' })).toBeDisabled();
    await viewer.getByRole('button', { name: 'Close image viewer' }).click();

    await page.locator('.case-mockups').nth(1).locator('.screen-mockup img').first().click();
    await expect(viewer.locator('.media-viewer__caption')).toHaveText('Feed');
    await expect(viewer.locator('.media-viewer__position')).toHaveText('1 / 4');
    await viewer.getByRole('button', { name: 'Close image viewer' }).click();
  });
});

test.describe('CrossCom case study', () => {
  test('desktop page follows the shared case-study geometry and loads every image', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    const response = await page.goto(new URL('/crosscom.html', baseUrl).href, {
      waitUntil: 'domcontentloaded',
    });

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1, name: 'CrossCom' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'What I learned' })).toBeAttached();
    await expect(page.locator('.case-media')).toHaveCount(12);
    await expect(page.locator('.case-media img')).toHaveCount(13);
    await expect(page.locator('.case-mockups--desktop')).toHaveCount(2);
    await expect(page.locator('.case-mockups--desktop .screen-mockup img')).toHaveCount(4);

    const geometry = await page.evaluate(() => {
      const rect = (selector) => {
        const bounds = document.querySelector(selector).getBoundingClientRect();
        return { width: bounds.width, height: bounds.height };
      };

      return {
        scrollWidth: document.documentElement.scrollWidth,
        main: rect('.case-main'),
        hero: rect('.case-hero-image'),
        summary: rect('.case-summary'),
        text: rect('.case-content > p'),
        mobileCompositeFit: window.getComputedStyle(
          document.querySelector('.case-media--crosscom-mobile img'),
        ).objectFit,
        brokenImages: Array.from(document.querySelectorAll('.case-main img')).filter(
          (image) => !image.complete || image.naturalWidth === 0,
        ).length,
      };
    });

    expect(geometry.scrollWidth).toBe(1400);
    expect(geometry.main.width).toBe(1200);
    expect(geometry.hero).toEqual({ width: 1200, height: 543 });
    expect(geometry.summary.width).toBe(760);
    expect(geometry.text.width).toBe(760);
    expect(geometry.mobileCompositeFit).toBe('contain');
    expect(geometry.brokenImages).toBe(0);
  });

  test('desktop mockup presentations reuse the shared scrolling behavior', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto(new URL('/crosscom.html', baseUrl).href, { waitUntil: 'domcontentloaded' });

    const presentations = page.locator('.case-mockups--desktop');
    const first = presentations.first();
    const second = presentations.nth(1);
    const firstViewport = first.locator('.case-mockups__viewport');
    const next = first.getByRole('button', { name: 'Show next mockups' });
    const previous = first.getByRole('button', { name: 'Show previous mockups' });

    const geometry = await page.evaluate(() => {
      const text = document.querySelector('.case-content > p').getBoundingClientRect();
      const presentations = document.querySelectorAll('.case-mockups--desktop');
      const firstImages = presentations[0].querySelectorAll('.screen-mockup img');
      const secondImages = presentations[1].querySelectorAll('.screen-mockup img');

      return {
        pageWidth: document.documentElement.scrollWidth,
        firstLeft: firstImages[0].getBoundingClientRect().left,
        textLeft: text.left,
        firstSizes: Array.from(firstImages).map((image) => ({
          width: image.getBoundingClientRect().width,
          height: image.getBoundingClientRect().height,
        })),
        secondSizes: Array.from(secondImages).map((image) => ({
          width: image.getBoundingClientRect().width,
          height: image.getBoundingClientRect().height,
        })),
      };
    });

    expect(geometry.pageWidth).toBe(1400);
    expect(geometry.firstLeft).toBe(geometry.textLeft);
    expect(geometry.firstSizes).toEqual([
      { width: 760, height: 570 },
      { width: 760, height: 570 },
    ]);
    expect(geometry.secondSizes).toEqual([
      { width: 1011, height: 575 },
      { width: 760, height: 575 },
    ]);
    await expect(firstViewport).toHaveCSS('overflow-x', 'auto');
    await expect(previous).toBeHidden();
    await expect(next).toBeVisible();

    await next.click({ force: true });
    await expect.poll(() => firstViewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(previous).toBeVisible();

    const secondViewport = second.locator('.case-mockups__viewport');
    await secondViewport.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    const endAlignment = await second.evaluate((element) => {
      const text = document.querySelector('.case-content > p');
      const images = element.querySelectorAll('.screen-mockup img');
      return images[images.length - 1].getBoundingClientRect().right - text.getBoundingClientRect().right;
    });

    expect(endAlignment).toBe(0);
  });

  test('desktop mockups use isolated mobile viewer sequences', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(new URL('/crosscom.html', baseUrl).href, { waitUntil: 'domcontentloaded' });

    const viewer = page.getByRole('dialog', { name: 'Image viewer' });
    const presentations = page.locator('.case-mockups--desktop');
    const firstImage = presentations.first().locator('.screen-mockup img').first();
    const secondGroupImage = presentations.nth(1).locator('.screen-mockup img').first();

    await expect(firstImage).toHaveAttribute('role', 'button');
    await firstImage.click();
    await expect(viewer.locator('.media-viewer__position')).toHaveText('1 / 2');
    await expect(viewer.locator('.media-viewer__caption')).toHaveText(
      'Starting a new report from scratch, a previous report, or a template.',
    );
    await viewer.getByRole('button', { name: 'Close image viewer' }).click();

    await secondGroupImage.click();
    await expect(viewer.locator('.media-viewer__position')).toHaveText('1 / 2');
    await expect(viewer.locator('.media-viewer__caption')).toHaveText(
      'Reacting to a full report or selected text with quick responses, emoji, and stickers.',
    );
  });

  test('callout uses the same shared component styles as Lakku', async ({ page }) => {
    const readCalloutStyles = () =>
      page.locator('.case-callout').first().evaluate((element) => {
        const callout = window.getComputedStyle(element);
        const label = window.getComputedStyle(element.querySelector('span'));
        const body = window.getComputedStyle(element.querySelector('strong'));

        return {
          background: callout.backgroundColor,
          radius: callout.borderRadius,
          padding: callout.padding,
          gap: callout.gap,
          label: {
            color: label.color,
            size: label.fontSize,
            weight: label.fontWeight,
            lineHeight: label.lineHeight,
          },
          body: {
            size: body.fontSize,
            weight: body.fontWeight,
            lineHeight: body.lineHeight,
          },
        };
      });

    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto(new URL('/lakku.html', baseUrl).href, { waitUntil: 'domcontentloaded' });
    const lakkuStyles = await readCalloutStyles();

    await page.goto(new URL('/crosscom.html', baseUrl).href, { waitUntil: 'domcontentloaded' });
    const crossComStyles = await readCalloutStyles();

    expect(crossComStyles).toEqual(lakkuStyles);
    expect(crossComStyles).toMatchObject({
      radius: '8px',
      padding: '16px 24px',
      gap: '4px',
      label: { size: '16px', weight: '600', lineHeight: '23px' },
      body: { size: '24px', weight: '400', lineHeight: '28px' },
    });
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
      '/assets/hero-portrait@2x.png',
      '/assets/projects/lakku-thumbnail@2x.png',
      '/assets/projects/crosscom-thumbnail@2x.png',
      '/assets/projects/archive-preview@2x.png',
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

    const resume = page.getByRole('link', { name: 'Resume', exact: true });
    const portfolio = page.getByRole('link', { name: 'More archive work on Behance' });
    const contact = page.getByRole('link', { name: 'Contact', exact: true });

    await resume.focus();
    await expect(resume).toBeFocused();

    if (page.context().browser()?.browserType().name() !== 'webkit') {
      await page.keyboard.press('Tab');
      await expect(contact).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(portfolio).toBeFocused();
    }

    await expect(page.locator('.intro__image')).toHaveCount(1);
    await expect(page.locator('.case-card')).toHaveCount(2);

    const heroMark = page.locator('.wordmark');
    await expect
      .poll(async () =>
        heroMark.evaluate((element) => ({
          color: window.getComputedStyle(element).color,
        })),
      )
      .toEqual({
        color: 'rgb(52, 110, 23)',
      });

    await expect
      .poll(() =>
        page
          .locator('.footer__wordmark')
          .evaluate((element) => window.getComputedStyle(element).color),
      )
      .toBe('rgb(63, 77, 57)');

    const axeResults = await new AxeBuilder({ page }).analyze();
    expect(axeResults.violations).toEqual([]);
  });
});

test.describe('homepage analytics and responsive layout', () => {
  test('custom analytics hooks are attached to CTA, portfolio and contact links', async ({ page }) => {
    await openHome(page);

    await expect(page.locator('script[src="analytics.js"]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Resume', exact: true })).toHaveAttribute(
      'data-analytics',
      'portfolio-cta',
    );
    await expect(page.getByRole('link', { name: 'More archive work on Behance' })).toHaveAttribute(
      'data-analytics',
      'portfolio-link',
    );
    await expect(page.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute(
      'data-analytics',
      'contact-link',
    );
  });

  test('CTA, portfolio and contact clicks send GA4 custom events into dataLayer', async ({ page }) => {
    await openHome(page);

    await page.getByRole('link', { name: 'Resume', exact: true }).click();
    await page.getByRole('link', { name: 'More archive work on Behance' }).click();
    await page.getByRole('link', { name: 'Contact', exact: true }).evaluate((link) => {
      link.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
        },
        { capture: true },
      );
    });
    await page.getByRole('link', { name: 'Contact', exact: true }).click();

    const analyticsEvents = await readAnalyticsEvents(page, [
      'portfolio_cta_click',
      'portfolio_click',
      'contact_click',
    ]);

    expect(analyticsEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'portfolio_cta_click',
          params: expect.objectContaining({
            page_path: '/',
            page_title: 'Denis Matveev | Product Designer',
            link_url: expect.stringContaining('/assets/CV_Denis_Matveev.pdf'),
            link_text: 'Resume',
            section_name: 'hero',
          }),
        }),
        expect.objectContaining({
          name: 'portfolio_click',
          params: expect.objectContaining({
            page_path: '/',
            page_title: 'Denis Matveev | Product Designer',
            link_url: 'https://www.behance.net/denmatveev',
            link_text: 'More archive work on Behance',
            section_name: 'works',
          }),
        }),
        expect.objectContaining({
          name: 'contact_click',
          params: expect.objectContaining({
            page_path: '/',
            page_title: 'Denis Matveev | Product Designer',
            link_url: 'mailto:denis.vic.matveev@gmail.com',
            link_text: 'Contact',
            contact_type: 'email',
            section_name: 'hero',
          }),
        }),
      ]),
    );
  });

  test('scroll milestones fire once per page load', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 500 });
    await openHome(page);

    await expect
      .poll(async () => {
        await page.evaluate(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
          window.dispatchEvent(new Event('scroll'));
        });

        return readAnalyticsEvents(page, ['scroll_50', 'scroll_90']);
      })
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'scroll_50',
            params: expect.objectContaining({
              page_path: '/',
              page_title: 'Denis Matveev | Product Designer',
              percent_scrolled: 50,
            }),
          }),
          expect.objectContaining({
            name: 'scroll_90',
            params: expect.objectContaining({
              page_path: '/',
              page_title: 'Denis Matveev | Product Designer',
              percent_scrolled: 90,
            }),
          }),
        ]),
      );

    const scrollEvents = await readAnalyticsEvents(page, ['scroll_50', 'scroll_90']);

    expect(scrollEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'scroll_50',
          params: expect.objectContaining({
            page_path: '/',
            page_title: 'Denis Matveev | Product Designer',
            percent_scrolled: 50,
          }),
        }),
        expect.objectContaining({
          name: 'scroll_90',
          params: expect.objectContaining({
            page_path: '/',
            page_title: 'Denis Matveev | Product Designer',
            percent_scrolled: 90,
          }),
        }),
      ]),
    );

    expect(scrollEvents.filter((entry) => entry.name === 'scroll_50')).toHaveLength(1);
    expect(scrollEvents.filter((entry) => entry.name === 'scroll_90')).toHaveLength(1);
  });

  test('qualified visit fires once after delay and meaningful engagement', async ({ page }) => {
    await page.addInitScript(() => {
      window.__portfolioAnalyticsConfig = {
        qualifiedVisitDelayMs: 25,
      };
    });

    await page.setViewportSize({ width: 390, height: 500 });
    await openHome(page);

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      window.dispatchEvent(new Event('scroll'));
    });

    await expect
      .poll(async () => readAnalyticsEvents(page, ['qualified_visit']))
      .toEqual([
        expect.objectContaining({
          name: 'qualified_visit',
          params: expect.objectContaining({
            page_path: '/',
            page_title: 'Denis Matveev | Product Designer',
            qualified_reason: expect.stringMatching(/scroll_50|scroll_90/),
            engagement_time_bucket: '10_to_29s',
          }),
        }),
      ]);
  });

  test('desktop layout does not overflow', async ({ page }) => {
    await page.setViewportSize({ width: viewportWidth, height: 1024 });
    await openHome(page);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);

    await expect(page.locator('.intro')).toBeVisible();

    const topbarBottom = await page
      .locator('.topbar')
      .evaluate((element) => element.getBoundingClientRect().bottom);
    const contentTop = await page
      .locator('.page-content')
      .evaluate((element) => element.getBoundingClientRect().top);

    expect(contentTop - topbarBottom).toBe(10);
  });

  test('mobile layout uses an accessible expandable menu and avoids horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });
    await expect(menuToggle).toBeVisible();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.topbar__nav')).toBeHidden();

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.topbar__nav')).toBeVisible();

    const boxes = await page.locator('.nav-item').evaluateAll((elements) =>
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

    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.topbar__nav')).toBeHidden();

    const caseBoxes = await page.locator('.case-card').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }),
    );

    expect(caseBoxes).toHaveLength(2);
    expect(caseBoxes[0].left).toBe(16);
    expect(caseBoxes[0].right).toBe(374);
    expect(caseBoxes[1].top).toBeGreaterThan(caseBoxes[0].bottom);

    const factBoxes = await page.locator('.fact').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      }),
    );

    expect(factBoxes).toHaveLength(3);
    expect(factBoxes[0].left).toBe(16);
    expect(factBoxes[0].right).toBe(374);
    expect(factBoxes[1].top).toBeGreaterThan(factBoxes[0].bottom);
    expect(factBoxes[2].top).toBeGreaterThan(factBoxes[1].bottom);
    await expect(page.locator('.intro__image')).toHaveCSS('width', '160px');

    const archiveAlignment = await page.locator('.archive-link').evaluate((element) => {
      const link = element.getBoundingClientRect();
      const preview = element.querySelector('.archive-link__previews').getBoundingClientRect();
      return { linkHeight: link.height, linkBottom: link.bottom, previewBottom: preview.bottom };
    });

    expect(archiveAlignment.linkHeight).toBe(64);
    expect(archiveAlignment.previewBottom).toBeCloseTo(archiveAlignment.linkBottom, 4);
  });

  test('tablet layout uses stacked cases and a two-column facts grid', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openHome(page);

    const caseBoxes = await page.locator('.case-card').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, top: rect.top, bottom: rect.bottom };
      }),
    );

    expect(caseBoxes).toHaveLength(2);
    expect(caseBoxes[0].width).toBe(720);
    expect(caseBoxes[1].top).toBeGreaterThan(caseBoxes[0].bottom);

    const factBoxes = await page.locator('.fact').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
      }),
    );

    expect(factBoxes).toHaveLength(3);
    expect(factBoxes[0].top).toBe(factBoxes[1].top);
    expect(factBoxes[1].left).toBeGreaterThan(factBoxes[0].left);
    expect(factBoxes[2].top).toBeGreaterThan(factBoxes[0].top);

    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeHidden();
    await expect(page.locator('.topbar__nav')).toBeVisible();
  });
});
