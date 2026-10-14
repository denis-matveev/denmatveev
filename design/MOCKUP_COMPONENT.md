# Shared Mockup component

Figma: [Mockup, 1330:5756](https://www.figma.com/design/EMlp0khGCyR9K2I8mvk0Ay/Official-Portfolio?node-id=1330-5756).

This static HTML component is defined by `styles/mockup.css` and `mockup.js`.
Reuse the following semantic structure on any case-study page. Load its stylesheet
after the base case styles and its script before the shared `media-viewer.js`.

```html
<figure class="case-media mockup" data-figma-component="1330:5756"
        style="--media-canvas-width: 678px; --media-canvas-height: 700px;">
  <div class="mockup__viewport" data-fit-span="290">
    <div class="mockup__canvas">
      <img src="../assets/example@2x.png" width="1356" height="1400"
           alt="Describe the composition" loading="lazy" />
    </div>
  </div>
</figure>
```

## Visual contract

- The viewport uses `bg/container-shallow` for its background, `radius/32`
  for its corners, clips its content and has no fixed inner padding, matching
  the Figma component. Neutral artwork must have transparent backgrounds.
- A `.mockup__canvas` corresponds to the Figma Content slot. It holds the
  flattened 2x composition, optional `.mockup__screen` video overlays and
  `.mockup__label` captions. Captions use Karla and `text/secondary`.
- Width, height, protected span and overlay coordinates are instance layout
  data. They do not introduce visual variants of the component.
- The `.case-media` class connects every instance to the shared mobile viewer
  and the page's existing Media sequence.

## Responsive sizing

At the native width, the original Figma canvas is centred. The viewport narrows
first while the canvas retains its native size. Once protected content reaches
the side inset, the canvas and viewport height scale together:

`scale = min(1, max(0, (viewportWidth - 2 × inset) / protectedSpan))`

The inset comes from `space/24`. For content extending from `left` to `right`
on a canvas of width `W`, choose a protected span of at least
`2 × max(W/2 - left, right - W/2)`, including bezels and shadows. This preserves
the Figma placement even for off-centre compositions and guarantees a minimum
24px inset on each side. A centred composition reaches 24px on both sides.

`ResizeObserver` measures each viewport, so the same behavior works in a full
width row, a grid column or a stacked mobile layout. The canvas never grows
beyond its native size. Without JavaScript the 2x image scales proportionally.
The viewport must use `flex: none` to retain its measured height after the canvas
becomes absolutely positioned; the base Media's `flex: 1` must not override it.

## Current Lakku instances

All seven have a 700px native height. Wide compositions use a 1400px canvas;
the other five use 678px.

| Content | Protected span | Figma instance suffix |
| --- | ---: | --- |
| How Lakku works | 368px | 1330:52909 |
| Create menu comparison | 630px | 1330:50355 |
| Video styles | 418px | 1330:50108 |
| Quality and cost | 1090px | 1330:41081 |
| Marketplace Pack | 290px | 1330:48379 |
| AI influencer | 360px | 1330:49566 |
| Readiness score | 380px | 1330:48996 |

The core-flow screen is positioned at x=204.8845825, y=51.4333801 on its native
canvas, with the original Figma mask. The video-styles screen is at x=130, y=79,
with a 417×892px frame; Marketplace Pack is at x=194, y=59 with a 290×582px frame.
All three videos autoplay, remain muted, loop and play inline. Their overlays
appear only after a frame is decoded; the exported poster remains the fallback.
Images, videos and captions share one transform, so they stay aligned while resizing.

## Comparison layout and exports

The Create menu comparison retains Figma's native geometry: a 20px label at
y=31, a 16px gap, and a 582px screen starting at y=67. The screens are 275px
and 274.2518px wide, with an 80px horizontal gap. Their left edges are x=385
and x=740 on the 1400px canvas. The bottom inset is 51px.

When exporting foreground artwork, set caption opacity to zero on a temporary
copy. Keep the caption nodes in their Auto Layout frames. Removing or hiding
them from layout shrinks the frames and recentres the composition, altering
the screen positions. HTML captions use the original Figma coordinates above.
