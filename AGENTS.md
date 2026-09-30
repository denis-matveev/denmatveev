# Portfolio site rules

- Build a static portfolio site with plain HTML, CSS, and minimal vanilla JS.
- Keep it fully compatible with GitHub Pages.
- Do not use React, Next.js, Tailwind, Vite, or npm build steps.
- Reuse shared CSS variables and layout classes.
- Match Figma hierarchy, spacing, and typography closely.
- Prioritize readability, accessibility, and responsive layout.
- Avoid unnecessary animations.
- Use semantic HTML.

# Shared case-study component rules

- Reuse the same semantic HTML structure and base CSS class for the same Figma component across every case-study page.
- Do not add case-specific visual modifiers to a shared component unless the linked Figma component defines a corresponding variant or the user explicitly requests a deviation.
- Keep content and layout-specific sizing outside the shared component's visual contract whenever possible.
- The shared `Callout` component uses `bg/container-prominent`, a 4px gap, 16px vertical and 24px horizontal padding, and an 8px radius.
- The `Callout` label uses the 16px/23px semibold body style with `text/accent`; its body uses the 24px/28px regular button style with `text/primary`.

# Case-study project navigation rules

- Every new case-study page must include the shared previous/next project controls at the end of its main content, before the footer: the `.case-projects` navigation and `case-projects.js`.
- When adding, removing, or reordering a case, update the Selected work cards on the homepage, which are the source of truth for navigation order, project titles, links, and thumbnail assets. Verify that the controls on the new case and its neighboring cases reflect the updated order.
- Reuse the homepage thumbnail images and their cropping, including image positioning; do not show text embedded below a thumbnail's preview area.
- Hide the corresponding card when no previous or next project exists, and stretch the remaining card across the full navigation width. Hide the navigation when neither exists.
- Keep these controls shared across all case-study pages, with the same styling, accessible links, and responsive behavior; do not create page-specific implementations.

# Mockup presentation rules

- The `mockup presentation` component may extend beyond the viewport when its mockups exceed the available width.
- Preserve horizontal scrolling for the component, including touch and trackpad gestures.
- Treat mobile and desktop screen layouts as size variants of the same component. Keep the scrolling, controls, alignment, overflow, accessibility, and mobile viewer behavior shared; only instance dimensions and content may differ.
- Match the Figma `Overflow` property: when `Off`, center the mockup group within the content area; when `On`, enable the overflowing presentation.
- With `Overflow=On`, align the left edge of the first mockup with the left edge of the text content column at the initial scroll position.
- With `Overflow=On`, provide enough trailing scroll space for the right edge of the final mockup to align with the right edge of the text content column at the end of the scroll range.
- Keep mockup shadows fully visible within the component's vertical overflow area; do not clip them at the bottom or sides.
- Provide previous/left and next/right navigation arrows whenever content is available in the corresponding scroll direction.
- Show navigation arrows only while the presentation is hovered or contains keyboard focus. Hide the left arrow at the initial scroll position and the right arrow at the end of the scroll range.
- Position each arrow 24px from its corresponding viewport edge. Match the Figma `Button` component at node `300:28355`: 40px circular size, 24px Untitled UI arrow icon, `bg/container-shallow` background, `secondary/border` 1px border, pill radius, `icon-primary` icon color, and shared interaction-state tokens.
- Hide mockup presentation navigation arrows entirely on mobile viewports (640px and below); mobile navigation must rely on touch scrolling.
- Keep the overflow behavior scoped to the mockup presentation so the page itself does not acquire unintended horizontal scrolling.

# Case media viewer rules

- Use the shared `media-viewer.js` component on every case-study page; do not build page-specific lightboxes.
- On mobile viewports (640px and below), tapping an image in a `Media` component or a screen inside a `mockup presentation` must open it in the shared full-screen viewer.
- Do not enable the full-screen viewer on wider viewports unless explicitly requested.
- Treat all `Media` components on the current case-study page as one viewer sequence.
- Treat each `mockup presentation` as its own viewer sequence. Navigation must never continue into a neighboring mockup presentation.
- Opening the viewer must not interfere with horizontal touch or trackpad scrolling inside a mockup presentation; a drag used for scrolling must not be treated as a tap.
- Support horizontal swipes and previous/next controls for moving through the active viewer sequence.
- Support pinch zoom, double-tap zoom, and explicit zoom controls. Keep zoom between 100% and 400%, and allow panning while zoomed.
- At 100% zoom, allow a downward swipe to dismiss the viewer. The image should follow the gesture and the backdrop and controls should fade; short gestures must return the image to its resting position.
- Allow closing through the Untitled UI `x-close` control, the `Escape` key, or a tap on empty backdrop space.
- Use the exact exported 24px Untitled UI assets in `assets/icons/untitled-ui/` for close, zoom, and previous/next controls. Render them through `currentColor` so semantic theme tokens control their color.
- Lock page scrolling while the viewer is open and restore it when the viewer closes.
- Expose the viewer as an accessible modal dialog, label every control, support keyboard navigation, and return focus to the image that opened it.
- Keep the current image caption and sequence position visible in the viewer.

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
