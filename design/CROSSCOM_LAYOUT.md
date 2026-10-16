# CrossCom case study

Source: [Figma, 1351:53721](https://www.figma.com/design/EMlp0khGCyR9K2I8mvk0Ay/Official-Portfolio?node-id=1351-53721).

The page at `crosscom/index.html` uses the shared editorial layouts and the
[Mockup component](MOCKUP_COMPONENT.md). No page-specific visual variants or
styles are needed. Text, facts and results remain semantic HTML.

All composed Figma artwork is flattened at 2× in `assets/projects/crosscom/story/`.
Mockup backgrounds are transparent so the shared theme controls their surface.
The comparison's Before/After captions are HTML on the original Figma canvas.

| Media | Native canvas | Protected span | Source instance suffix |
| --- | --- | --- | --- |
| Hero | 1400 × 700 | 1328 | 1306:72701 |
| Before/after | 1400 × 700 | 1340 | 1351:54122 |
| Core flow | 1400 × 780 | 984 | 1356:92595 |
| AI help | 678 × 700 | 592 | 1377:49720 |
| Feedback | 678 × 700 | 550 | 1377:49739 |
| Search | 678 × 700 | 532 | 1392:54295 |
| Search results | 1400 × 693 | 1048 | 1392:54660 |
| Automatic tags | 1400 × 693 | 1238 | 1379:54227 |
| Mobile | 1400 × 780 | 1314 | 1387:55285 |
| Manager overview | 1400 × 1216 | 1048 | 1392:52607 |

The core-flow, AI-help and project-tag MP4 demos autoplay, stay muted, loop and play inline through
the existing `.mockup__screen` behavior. Figma exports remain the loading/error
fallback and the images used in the shared mobile viewer.

The search section uses Figma's static Search results screen at x=188, y=64
on its 1400 × 693 canvas. Its 2× flattened export is also the image shown in
the shared mobile viewer. The project-tags section now uses the updated Figma
video's first frame with 24px top corners and square bottom corners. Its media
rectangle remains at x=93, y=99, sized 1214 × 594 on the 1400 × 693 canvas.
The supplied `CrossComTagSearch.mp4` is saved as `tag-search.mp4`; its SHA-1
matches Figma video hash `e5959d92316b82b112aa4a8aa6247f3382222de4`.
The video and fallback use the same placement and 24px top-corner clipping.

The existing homepage card, project order and cover stay unchanged. The shared
navigation reads that card list: Lakku.ai → CrossCom → iHairium.

The page retains one Google Analytics bootstrap, one shared event script and
one Clarity installation. Header/footer CTA annotations and the outcome block
use the same tracking conventions as the other case studies. Both GA scripts
retain their production-domain restrictions.
