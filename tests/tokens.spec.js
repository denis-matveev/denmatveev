// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokensCss = readFileSync(resolve(process.cwd(), 'styles/tokens.css'), 'utf8');
const themeCss = readFileSync(resolve(process.cwd(), 'styles/theme.css'), 'utf8');
const expected = JSON.parse(
  readFileSync(resolve(process.cwd(), 'tests/fixtures/figma-tokens.json'), 'utf8'),
);

function extractBlock(css, marker) {
  const start = css.indexOf(marker);
  expect(start, `Expected CSS block marker "${marker}"`).toBeGreaterThanOrEqual(0);

  const braceStart = css.indexOf('{', start);
  let depth = 0;

  for (let index = braceStart; index < css.length; index += 1) {
    const char = css[index];

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        return css.slice(braceStart + 1, index);
      }
    }
  }

  throw new Error(`Unclosed CSS block for marker "${marker}"`);
}

function parseCustomProps(block) {
  const props = {};
  const matches = block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g);

  for (const [, name, value] of matches) {
    props[name] = value.trim();
  }

  return props;
}

function expectProps(actual, expectedProps) {
  for (const [name, value] of Object.entries(expectedProps)) {
    expect(actual[name], `Mismatch for ${name}`).toBe(value);
  }
}

test.describe('figma token sync', () => {
  test('declares exactly the tracked synced tokens', () => {
    const allBlocks = [
      parseCustomProps(extractBlock(tokensCss, ':root')),
      parseCustomProps(extractBlock(tokensCss, '@media (max-width: 900px)')),
      parseCustomProps(extractBlock(themeCss, ':root,\n:root[data-theme="light"]')),
      parseCustomProps(extractBlock(themeCss, ':root[data-theme="dark"]')),
    ];

    const declaredVars = [...new Set(allBlocks.flatMap((block) => Object.keys(block)))]
      .filter(
        (name) =>
          name.startsWith('--color-primitives-') ||
          name.startsWith('--color-semantics-') ||
          name.startsWith('--buttons-') ||
          name.startsWith('--typography-font-') ||
          name.startsWith('--typography-styles-') ||
          name.startsWith('--sizes-space-') ||
          name.startsWith('--sizes-radius-') ||
          name.startsWith('--sizes-size-'),
      )
      .sort();

    expect(declaredVars).toEqual([...expected.declaredTokenVars].sort());
  });

  test('matches synced root token values', () => {
    const rootProps = parseCustomProps(extractBlock(tokensCss, ':root'));
    expectProps(rootProps, expected.tokensRoot);
  });

  test('matches synced mobile token overrides', () => {
    const mobileProps = parseCustomProps(extractBlock(tokensCss, '@media (max-width: 900px)'));
    expectProps(mobileProps, expected.tokensMobile);
  });

  test('matches figma light theme semantic and button tokens', () => {
    const lightProps = parseCustomProps(extractBlock(themeCss, ':root,\n:root[data-theme="light"]'));
    expectProps(lightProps, expected.themeLight);
  });

  test('matches figma dark theme semantic and button tokens', () => {
    const darkProps = parseCustomProps(extractBlock(themeCss, ':root[data-theme="dark"]'));
    expectProps(darkProps, expected.themeDark);
  });
});
