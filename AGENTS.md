# Portfolio site rules

- Build a static portfolio site with plain HTML, CSS, and minimal vanilla JS.
- Keep it fully compatible with GitHub Pages.
- Do not use React, Next.js, Tailwind, Vite, or npm build steps.
- Reuse shared CSS variables and layout classes.
- Match Figma hierarchy, spacing, and typography closely.
- Prioritize readability, accessibility, and responsive layout.
- Avoid unnecessary animations.
- Use semantic HTML.

# Mockup presentation rules

- The `mockup presentation` component may extend beyond the viewport when its mockups exceed the available width.
- Preserve horizontal scrolling for the component, including touch and trackpad gestures.
- At the initial scroll position, align the left edge of the first mockup with the left edge of the text content column.
- Provide enough trailing scroll space for the right edge of the final mockup to align with the right edge of the text content column at the end of the scroll range.
- Keep mockup shadows fully visible within the component's vertical overflow area; do not clip them at the bottom or sides.
- Provide only a forward/right navigation arrow. Backward navigation remains available through touch and trackpad scrolling; do not add a left arrow.
- Show the right arrow only while the presentation is hovered or contains keyboard focus, and only while additional content is available to the right.
- Position the right arrow 24px from the right edge of the viewport. Use a 56px circular button with a solid white background and the site's shared color, border, icon, and interaction-state tokens.
- Hide the right arrow once the presentation reaches the end of its scroll range.
- Keep the overflow behavior scoped to the mockup presentation so the page itself does not acquire unintended horizontal scrolling.

# Figma asset export rules

- Export all raster images from Figma at 2x resolution for Retina displays.
- Export composed previews and multi-layer image groups as a single flattened image at 2x.
- Store exported Retina assets with an `@2x` suffix when the asset is not already named for its scale.

# Typography rules

- Use Google Fonts only for typography.
- Primary font: Karla
- Secondary font: Climate Crisis
- Load fonts from Google Fonts, not from local files.
- Do not substitute fonts unless explicitly asked.
- Match the Figma typography scale as closely as possible.
- Expose font families through CSS variables.
