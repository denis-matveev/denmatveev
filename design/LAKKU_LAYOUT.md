# Lakku case: fluid layout

Figma reference: [updated case, node 1298:72503](https://www.figma.com/design/EMlp0khGCyR9K2I8mvk0Ay/Official-Portfolio?node-id=1298-72503).

The implementation uses plain HTML and shared CSS layouts in
`styles/case-editorial.css`. It requires no build step.

## Width and columns

- The page grows to `size/max-content` (1400px), with fluid side gutters from
  16px to 50px. At the reference viewport of 1500px, the content is exactly
  1400px wide.
- Equal columns use `repeat(2, minmax(0, 1fr))`. Contribution and the introduction
  to full-width panels use a 2:1 grid. The regular column gap grows from 24px to
  the reference 44px; compact introduction rows retain a 24px gap.
- Below 1000px, grids become one column. Text precedes its related illustration
  in the HTML, even where the desktop layout places the illustration on the left.
  Metrics retain two columns until the mobile breakpoint of 640px.
- Section headings scale from 32px to 44px and body text from 20px to 28px.
  Header typography continues to use the shared Karla and Climate Crisis tokens.
- Header Factoid line-height and internal label/value spacing scale with the
  corresponding font sizes. Unitless line-height retains the desktop ratios;
  the internal gap follows Figma Factoid 256:132's `space/4`: 0.2em of the label
  size (4px desktop, 3.2px mobile).
- `size/max-content-text` (760px) remains separate from the image-led page width.
  Existing prose-based cases, About, and adjacent-project controls use this token.

## Illustrations

Each composed Figma panel remains one exact, flattened PNG at 2x, rasterized
from its Figma SVG export to preserve transparency. The former inline first-click
heatmap comparison was removed in Figma and is no longer displayed.
The four neutral mockup panels export only their foregrounds. The container
background comes from `bg/container-shallow`, so it responds to both themes.
Before/After captions are semantic text overlays using `text/secondary`; they
share the same native canvas and scale as the mockup group.

The seven body panels map to the shared Figma `Mockup` component (1330:5756).
They use the same semantic `.case-media.mockup` structure, `styles/mockup.css`
and `mockup.js`. See [the component contract](MOCKUP_COMPONENT.md).
The hero remains a separate Media image, using the same fit controller.

Mockup panels use a shared two-stage fit:

1. Each composition retains its native Figma canvas (1400×700 or 678×700).
   The container narrows around that canvas while the mockups retain their
   original dimensions and spacing. Portrait containers stop growing at their
   native 678px width, including after the page grid becomes one column.
2. Once the protected content reaches the 24px side inset, the entire canvas
   scales uniformly: `scale = min(1, (containerWidth - 48) / protectedSpan)`.
   The panel height follows the same scale only after this threshold.

The protected span includes the group's offset from the native canvas centre,
phone bezels and shadows. This preserves the original Figma positioning and
keeps at least 24px on both sides. The two-phone comparison has a 630px span,
so it remains at full size down to a 678px container. The centred video-style
panel starts scaling below 466px; Marketplace Pack starts below 338px. The three-phone
quality comparison includes its enlarged detail cards and their shadows.

Every Mockup uses the same `.mockup__viewport` and `.mockup__canvas` structure.
`ResizeObserver` measures the actual container width rather than the window's
breakpoint. Without JavaScript, the existing proportionally responsive image
remains available. The shared Mockup supplies the 32px radius.

Three panels have silent, looping inline videos: the core creation flow, video
styles, and Marketplace Pack. Each video remains inside its image's canvas,
so one transform moves and scales the image and video together. Screen geometry
retains the exact Figma mask or corner radii. `mockup.js` reveals an overlay
after its first decoded frame and keeps the original image visible while loading
or if the video cannot load. Video overlays do not intercept taps.

There is no page-specific media viewer: on viewports up to 640px, all eight images
form one sequence in `media-viewer.js`. Wide comparisons can still become small
on phones after their fit threshold; tapping opens the shared viewer for zooming.
The separate mockup presentation component retains its existing Overflow
variants, scrolling, arrows and per-presentation viewer sequence.

## Project order

Selected work now contains Lakku, CrossCom, and iHairium in that order.
`case-projects.js` continues to derive navigation from those homepage cards.
Lakku uses the dedicated `assets/projects/lakku-thumbnail@2x.png` cover from
the user-supplied `lakku-thumb.png`, replacing the Figma export of Case preview
333:43685. The original file is copied without compression or resizing.
Adjacent-project navigation picks up the same cover and centred cropping.
The former Create and Video case URLs redirect to their sections in Lakku.

## Verification

Assets were visually checked against Figma and confirmed at 2x dimensions.
Checks cover native sizing above the fit threshold, continuous scaling below it,
24px side insets, restoring native size when growing, and stable height-only
resize notifications. Decoded video frames were composited at the exact Figma
coordinates to verify alignment. Neutral panels retain alpha backgrounds.
Static checks cover HTML references, section links, token regeneration, image
dimensions, and the shared navigation/viewer wiring. Automated browser rendering
was unavailable: the installed browser automation runtime has no Chromium, and
the in-app browser tool rejected access to the local URL. Manual viewport and
gesture checks remain necessary in the local preview.
