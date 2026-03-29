# Token Convention

This project uses a single token naming rule for generated CSS custom properties:

`--[collection]-[group]-[name]`

Collection names come from Figma collections and are normalized to kebab-case.

Examples:

- `Color primitives -> neutral -> 900` -> `--color-primitives-neutral-900`
- `Color semantics -> text -> primary` -> `--color-semantics-text-primary`
- `Buttons -> secondary -> bg-hover` -> `--buttons-secondary-bg-hover`
- `Typography -> font -> family-display` -> `--typography-font-family-display`
- `Typography -> styles -> hero-size` -> `--typography-styles-hero-size`
- `Sizes -> space -> 24` -> `--sizes-space-24`
- `Sizes -> radius -> 8` -> `--sizes-radius-8`
- `Sizes -> size -> logo-width` -> `--sizes-size-logo-width`

Notes:

- CSS output should not use a `figma-` prefix.
- Mode-specific values stay in modes, themes, or media overrides instead of being encoded into the token family name.
- `design/figma-tokens.source.json` is the source of truth for generated token artifacts.
- `scripts/sync-figma-tokens.js` must preserve this convention when generating CSS and test fixtures.
