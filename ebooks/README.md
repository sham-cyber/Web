# Kindle ebook source and updates

`static-site-replit-vercel-domain.md` is the editable source of truth for the book.

- The **Ebook Source Watcher** workflow builds the Kindle EPUB, browser-readable HTML, companion PDF, the source-generated Kindle cover, and paperback front-cover files when this Markdown file changes.
- Run `pnpm run ebook:build` in Shell to rebuild the files manually.
- Edit the Markdown source—not the generated HTML, PDF, or EPUB—when changing book content.
- The EPUB is a reflowable Kindle manuscript. Review it in Kindle Previewer before uploading it to KDP.
- `kindle-cover.jpg` is the source-generated Kindle cover option; its SVG is kept for editing.
- `paperback-front-cover.pdf` is a 6 × 9 inch front-cover page; its SVG is kept for editing.

The paperback PDF is only the front cover, not the complete back/spine/front wrap. Final paperback wrap dimensions require the finalized print interior and KDP specifications.

## Separate Kindle eBook cover

For the separate KDP upload, use [`static-site-kindle-cover.jpg`](static-site-kindle-cover.jpg), not the EPUB manuscript. In KDP, open the book's **Kindle eBook Content** step and upload this image in the **Book cover** section—not in the manuscript field.

This standalone cover is a 1600 × 2560 px RGB JPEG at 72 dpi, matching KDP's ideal eBook cover dimensions and supported format. Its editable typography layout is [`static-site-kindle-cover.svg`](static-site-kindle-cover.svg); the background artwork is in `../attached_assets/generated_images/static-site-kdp-cover-art.jpg`. It is not generated or changed by `ebook:build`; the source-generated cover remains available separately as `kindle-cover.jpg`.

See [KDP's eBook cover image criteria](https://kdp.amazon.com/en_US/help/topic/G200645690) for current requirements.
