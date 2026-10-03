---
name: SVG image rendering
description: A workspace-specific ImageMagick SVG conversion issue with linked raster artwork.
---

ImageMagick's SVG conversion silently omitted a linked local raster image during cover export in this workspace; the conversion succeeded but produced text over a blank background.

**Why:** A successful conversion did not guarantee that the embedded/linked image layer rendered.

**How to apply:** When raster artwork is linked from SVG, inspect the exported image. If the image layer is missing, render the raster artwork and SVG text separately and composite them.