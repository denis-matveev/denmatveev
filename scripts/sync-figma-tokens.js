#!/usr/bin/env node

const { mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

const rootDir = process.cwd();
const sourcePath = resolve(rootDir, 'design/figma-tokens.source.json');
const tokensCssPath = resolve(rootDir, 'styles/tokens.css');
const themeCssPath = resolve(rootDir, 'styles/theme.css');
const fixturePath = resolve(rootDir, 'tests/fixtures/figma-tokens.json');

const source = JSON.parse(readFileSync(sourcePath, 'utf8'));

function writeFile(filePath, contents) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
}

function linesToCssBlock(selector, lines) {
  return `${selector} {\n${lines.map((line) => (line ? `  ${line}` : '')).join('\n')}\n}\n`;
}

function indentBlock(block, prefix) {
  return block
    .trimEnd()
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
}

function tokenName(collection, group, name) {
  return `--${collection}-${group}-${name}`;
}

function tokenFromCompound(collection, compoundName) {
  const [group, ...rest] = compoundName.split('-');
  return tokenName(collection, group, rest.join('-'));
}

function buildTokensCss(data) {
  const rootLines = [
    ...Object.entries(data.space).map(([name, value]) => `${tokenName('sizes', 'space', name)}: ${value};`),
    '',
    ...Object.entries(data.radius).map(([name, value]) => `${tokenName('sizes', 'radius', name)}: ${value};`),
    '',
    `${tokenName('sizes', 'size', 'max-content')}: ${data.size['max-content']};`,
    `${tokenName('sizes', 'size', 'max-page')}: ${data.size['max-page']};`,
    `${tokenName('sizes', 'size', 'logo-width')}: ${data.size['logo-width'].desktop};`,
    `${tokenName('sizes', 'size', 'logo-mark-width')}: ${data.size['logo-mark-width'].desktop};`,
    `${tokenName('sizes', 'size', 'logo-mark-height')}: ${data.size['logo-mark-height'].desktop};`,
    `${tokenName('sizes', 'size', 'button-min-height')}: ${data.size['button-min-height']};`,
    `${tokenName('sizes', 'size', 'action-icon')}: ${data.size['action-icon']};`,
    `${tokenName('sizes', 'size', 'action-icon-brand')}: ${data.size['action-icon-brand']};`,
    '',
    ...Object.entries(data.colors).map(([name, value]) => `${tokenName('color-primitives', name.split('-')[0], name.split('-').slice(1).join('-'))}: ${value};`),
    '',
    `${tokenName('typography', 'font', 'family-display')}: ${data.fonts['family-display']};`,
    `${tokenName('typography', 'font', 'family-text')}: ${data.fonts['family-text']};`,
    `${tokenName('typography', 'font', 'size-hero')}: ${data.fonts['size-hero'].desktop};`,
    `${tokenName('typography', 'font', 'size-title')}: ${data.fonts['size-title'].desktop};`,
    `${tokenName('typography', 'font', 'size-body-lg')}: ${data.fonts['size-body-lg']};`,
    `${tokenName('typography', 'font', 'size-button')}: ${data.fonts['size-button']};`,
    `${tokenName('typography', 'font', 'line-hero')}: ${data.fonts['line-hero'].desktop};`,
    `${tokenName('typography', 'font', 'line-title')}: ${data.fonts['line-title'].desktop};`,
    `${tokenName('typography', 'font', 'line-body-lg')}: ${data.fonts['line-body-lg']};`,
    `${tokenName('typography', 'font', 'line-button')}: ${data.fonts['line-button']};`,
    `${tokenName('typography', 'font', 'weight-light')}: ${data.fonts['weight-light']};`,
    `${tokenName('typography', 'font', 'weight-regular')}: ${data.fonts['weight-regular']};`,
    `${tokenName('typography', 'font', 'weight-medium')}: ${data.fonts['weight-medium']};`,
    '',
    `${tokenName('typography', 'styles', 'hero-family')}: ${data.styles.hero.family};`,
    `${tokenName('typography', 'styles', 'hero-size')}: ${data.styles.hero.size.desktop};`,
    `${tokenName('typography', 'styles', 'hero-weight')}: ${data.styles.hero.weight};`,
    `${tokenName('typography', 'styles', 'hero-line-height')}: ${data.styles.hero['line-height'].desktop};`,
    `${tokenName('typography', 'styles', 'hero-color')}: ${data.styles.hero.color};`,
    '',
    `${tokenName('typography', 'styles', 'title-family')}: ${data.styles.title.family};`,
    `${tokenName('typography', 'styles', 'title-size')}: ${data.styles.title.size.desktop};`,
    `${tokenName('typography', 'styles', 'title-weight')}: ${data.styles.title.weight};`,
    `${tokenName('typography', 'styles', 'title-line-height')}: ${data.styles.title['line-height'].desktop};`,
    `${tokenName('typography', 'styles', 'title-color')}: ${data.styles.title.color};`,
    '',
    `${tokenName('typography', 'styles', 'body-lg-family')}: ${data.styles['body-lg'].family};`,
    `${tokenName('typography', 'styles', 'body-lg-size')}: ${data.styles['body-lg'].size};`,
    `${tokenName('typography', 'styles', 'body-lg-weight')}: ${data.styles['body-lg'].weight};`,
    `${tokenName('typography', 'styles', 'body-lg-line-height')}: ${data.styles['body-lg']['line-height']};`,
    `${tokenName('typography', 'styles', 'body-lg-color')}: ${data.styles['body-lg'].color};`,
    '',
    `${tokenName('typography', 'styles', 'button-family')}: ${data.styles.button.family};`,
    `${tokenName('typography', 'styles', 'button-size')}: ${data.styles.button.size};`,
    `${tokenName('typography', 'styles', 'button-weight')}: ${data.styles.button.weight};`,
    `${tokenName('typography', 'styles', 'button-line-height')}: ${data.styles.button['line-height']};`,
    `${tokenName('typography', 'styles', 'button-color')}: ${data.styles.button.color};`,
  ];

  const mobileLines = [
    `${tokenName('sizes', 'size', 'logo-width')}: ${data.size['logo-width'].mobile};`,
    `${tokenName('sizes', 'size', 'logo-mark-width')}: ${data.size['logo-mark-width'].mobile};`,
    `${tokenName('sizes', 'size', 'logo-mark-height')}: ${data.size['logo-mark-height'].mobile};`,
    '',
    `${tokenName('typography', 'font', 'size-hero')}: ${data.fonts['size-hero'].mobile};`,
    `${tokenName('typography', 'font', 'size-title')}: ${data.fonts['size-title'].mobile};`,
    `${tokenName('typography', 'font', 'line-hero')}: ${data.fonts['line-hero'].mobile};`,
    `${tokenName('typography', 'font', 'line-title')}: ${data.fonts['line-title'].mobile};`,
  ];

  return [
    '/* Auto-generated by scripts/sync-figma-tokens.js. Do not edit manually. */',
    linesToCssBlock(':root', rootLines),
    '@media (max-width: 900px) {',
    indentBlock(linesToCssBlock(':root', mobileLines), '  '),
    '}',
    '',
  ].join('\n');
}

function buildThemeCss(data) {
  const buildLines = (themeName) => {
    const theme = data.themes[themeName];
    const buttonTheme = data.buttons[themeName].secondary;
    const themeLines = Object.entries(theme).map(
      ([name, value]) => `${tokenFromCompound('color-semantics', name)}: ${value};`,
    );

    return [
      `color-scheme: ${themeName};`,
      '',
      ...themeLines,
      `${tokenName('buttons', 'secondary', 'text')}: ${buttonTheme.text};`,
      `${tokenName('buttons', 'secondary', 'icon')}: ${buttonTheme.icon};`,
      `${tokenName('buttons', 'secondary', 'border')}: ${buttonTheme.border};`,
      `${tokenName('buttons', 'secondary', 'bg')}: ${buttonTheme.bg};`,
      `${tokenName('buttons', 'secondary', 'bg-hover')}: ${buttonTheme['bg-hover']};`,
      `${tokenName('buttons', 'secondary', 'bg-pressed')}: ${buttonTheme['bg-pressed']};`,
    ];
  };

  return [
    '/* Auto-generated by scripts/sync-figma-tokens.js. Do not edit manually. */',
    linesToCssBlock(':root,\n:root[data-theme="light"]', buildLines('light')),
    linesToCssBlock(':root[data-theme="dark"]', buildLines('dark')),
  ].join('\n');
}

function buildFixture(data) {
  const declaredTokenVars = [];
  const tokensRoot = {};
  const tokensMobile = {};
  const themeLight = {};
  const themeDark = {};

  for (const [name, value] of Object.entries(data.space)) {
    const token = tokenName('sizes', 'space', name);
    declaredTokenVars.push(token);
    tokensRoot[token] = value;
  }

  for (const [name, value] of Object.entries(data.radius)) {
    const token = tokenName('sizes', 'radius', name);
    declaredTokenVars.push(token);
    tokensRoot[token] = value;
  }

  const sizeRootMap = {
    [tokenName('sizes', 'size', 'max-content')]: data.size['max-content'],
    [tokenName('sizes', 'size', 'max-page')]: data.size['max-page'],
    [tokenName('sizes', 'size', 'logo-width')]: data.size['logo-width'].desktop,
    [tokenName('sizes', 'size', 'logo-mark-width')]: data.size['logo-mark-width'].desktop,
    [tokenName('sizes', 'size', 'logo-mark-height')]: data.size['logo-mark-height'].desktop,
    [tokenName('sizes', 'size', 'button-min-height')]: data.size['button-min-height'],
    [tokenName('sizes', 'size', 'action-icon')]: data.size['action-icon'],
    [tokenName('sizes', 'size', 'action-icon-brand')]: data.size['action-icon-brand'],
  };
  Object.assign(tokensRoot, sizeRootMap);
  declaredTokenVars.push(...Object.keys(sizeRootMap));

  for (const [name, value] of Object.entries(data.colors)) {
    const [group, ...rest] = name.split('-');
    const token = tokenName('color-primitives', group, rest.join('-'));
    declaredTokenVars.push(token);
    tokensRoot[token] = value;
  }

  const fontMap = {
    [tokenName('typography', 'font', 'family-display')]: data.fonts['family-display'],
    [tokenName('typography', 'font', 'family-text')]: data.fonts['family-text'],
    [tokenName('typography', 'font', 'size-hero')]: data.fonts['size-hero'].desktop,
    [tokenName('typography', 'font', 'size-title')]: data.fonts['size-title'].desktop,
    [tokenName('typography', 'font', 'size-body-lg')]: data.fonts['size-body-lg'],
    [tokenName('typography', 'font', 'size-button')]: data.fonts['size-button'],
    [tokenName('typography', 'font', 'line-hero')]: data.fonts['line-hero'].desktop,
    [tokenName('typography', 'font', 'line-title')]: data.fonts['line-title'].desktop,
    [tokenName('typography', 'font', 'line-body-lg')]: data.fonts['line-body-lg'],
    [tokenName('typography', 'font', 'line-button')]: data.fonts['line-button'],
    [tokenName('typography', 'font', 'weight-light')]: data.fonts['weight-light'],
    [tokenName('typography', 'font', 'weight-regular')]: data.fonts['weight-regular'],
    [tokenName('typography', 'font', 'weight-medium')]: data.fonts['weight-medium'],
  };
  Object.assign(tokensRoot, fontMap);
  declaredTokenVars.push(...Object.keys(fontMap));

  const styleMap = {
    [tokenName('typography', 'styles', 'hero-family')]: data.styles.hero.family,
    [tokenName('typography', 'styles', 'hero-size')]: data.styles.hero.size.desktop,
    [tokenName('typography', 'styles', 'hero-weight')]: data.styles.hero.weight,
    [tokenName('typography', 'styles', 'hero-line-height')]: data.styles.hero['line-height'].desktop,
    [tokenName('typography', 'styles', 'hero-color')]: data.styles.hero.color,
    [tokenName('typography', 'styles', 'title-family')]: data.styles.title.family,
    [tokenName('typography', 'styles', 'title-size')]: data.styles.title.size.desktop,
    [tokenName('typography', 'styles', 'title-weight')]: data.styles.title.weight,
    [tokenName('typography', 'styles', 'title-line-height')]: data.styles.title['line-height'].desktop,
    [tokenName('typography', 'styles', 'title-color')]: data.styles.title.color,
    [tokenName('typography', 'styles', 'body-lg-family')]: data.styles['body-lg'].family,
    [tokenName('typography', 'styles', 'body-lg-size')]: data.styles['body-lg'].size,
    [tokenName('typography', 'styles', 'body-lg-weight')]: data.styles['body-lg'].weight,
    [tokenName('typography', 'styles', 'body-lg-line-height')]: data.styles['body-lg']['line-height'],
    [tokenName('typography', 'styles', 'body-lg-color')]: data.styles['body-lg'].color,
    [tokenName('typography', 'styles', 'button-family')]: data.styles.button.family,
    [tokenName('typography', 'styles', 'button-size')]: data.styles.button.size,
    [tokenName('typography', 'styles', 'button-weight')]: data.styles.button.weight,
    [tokenName('typography', 'styles', 'button-line-height')]: data.styles.button['line-height'],
    [tokenName('typography', 'styles', 'button-color')]: data.styles.button.color,
  };
  Object.assign(tokensRoot, styleMap);
  declaredTokenVars.push(...Object.keys(styleMap));

  Object.assign(tokensMobile, {
    [tokenName('sizes', 'size', 'logo-width')]: data.size['logo-width'].mobile,
    [tokenName('sizes', 'size', 'logo-mark-width')]: data.size['logo-mark-width'].mobile,
    [tokenName('sizes', 'size', 'logo-mark-height')]: data.size['logo-mark-height'].mobile,
    [tokenName('typography', 'font', 'size-hero')]: data.fonts['size-hero'].mobile,
    [tokenName('typography', 'font', 'size-title')]: data.fonts['size-title'].mobile,
    [tokenName('typography', 'font', 'line-hero')]: data.fonts['line-hero'].mobile,
    [tokenName('typography', 'font', 'line-title')]: data.fonts['line-title'].mobile,
  });

  for (const [themeName, bucket] of Object.entries({ light: themeLight, dark: themeDark })) {
    const theme = data.themes[themeName];
    const buttonTheme = data.buttons[themeName].secondary;
    const themeMap = {
      ...Object.fromEntries(
        Object.entries(theme).map(([name, value]) => [tokenFromCompound('color-semantics', name), value]),
      ),
      [tokenName('buttons', 'secondary', 'text')]: buttonTheme.text,
      [tokenName('buttons', 'secondary', 'icon')]: buttonTheme.icon,
      [tokenName('buttons', 'secondary', 'border')]: buttonTheme.border,
      [tokenName('buttons', 'secondary', 'bg')]: buttonTheme.bg,
      [tokenName('buttons', 'secondary', 'bg-hover')]: buttonTheme['bg-hover'],
      [tokenName('buttons', 'secondary', 'bg-pressed')]: buttonTheme['bg-pressed'],
    };

    Object.assign(bucket, themeMap);
    declaredTokenVars.push(...Object.keys(themeMap));
  }

  return JSON.stringify(
    {
      declaredTokenVars: [...new Set(declaredTokenVars)].sort(),
      tokensRoot,
      tokensMobile,
      themeLight,
      themeDark,
    },
    null,
    2,
  ) + '\n';
}

writeFile(tokensCssPath, buildTokensCss(source));
writeFile(themeCssPath, buildThemeCss(source));
writeFile(fixturePath, buildFixture(source));

process.stdout.write(
  [
    'Synced Figma token artifacts:',
    `- ${tokensCssPath}`,
    `- ${themeCssPath}`,
    `- ${fixturePath}`,
  ].join('\n') + '\n',
);
