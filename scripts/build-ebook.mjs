import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createBookCovers } from './ebook-covers.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(projectRoot, 'ebooks/static-site-replit-vercel-domain.md');
const htmlPath = join(projectRoot, 'ebooks/static-site-replit-vercel-domain.html');
const pdfPath = join(projectRoot, 'ebooks/static-site-replit-vercel-domain.pdf');
const epubPath = join(projectRoot, 'ebooks/static-site-replit-vercel-domain.epub');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseSource(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`Missing Markdown front matter in ${sourcePath}`);

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-z]+):\s*(.*)$/i);
    if (field) metadata[field[1]] = field[2].replace(/^["']|["']$/g, '');
  }
  if (!metadata.title || !metadata.language) {
    throw new Error('The book source must include title and language metadata.');
  }

  return { metadata, markdown: source.slice(match[0].length) };
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
}

function renderInline(value) {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_whole, label, url) => (
    `<a href="${url}">${label}</a>`
  ));
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return text;
}

function renderMarkdown(markdown) {
  const output = [];
  const headings = [];
  const lines = markdown.split(/\r?\n/);
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let quoteLines = [];
  let codeLines = null;
  let codeLanguage = '';
  const usedIds = new Set();

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType) return;
    const tag = listType === 'ordered' ? 'ol' : 'ul';
    output.push(`<${tag}>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`);
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    output.push(`<blockquote><p>${renderInline(quoteLines.join(' '))}</p></blockquote>`);
    quoteLines = [];
  };

  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    if (codeLines !== null) {
      if (/^```\s*$/.test(line)) {
        const className = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : '';
        output.push(`<pre><code${className}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = null;
        codeLanguage = '';
      } else {
        codeLines.push(line);
      }
      continue;
    }

    const fence = line.match(/^```([a-z0-9_-]*)\s*$/i);
    if (fence) {
      flushTextBlocks();
      codeLines = [];
      codeLanguage = fence[1];
      continue;
    }

    if (!line.trim()) {
      flushTextBlocks();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+?)\s*#*$/);
    if (heading) {
      flushTextBlocks();
      const level = heading[1].length;
      const title = heading[2].trim();
      let id = slugify(title);
      let suffix = 2;
      while (usedIds.has(id)) id = `${slugify(title)}-${suffix++}`;
      usedIds.add(id);
      headings.push({ level, id, title });
      output.push(`<h${level} id="${id}">${renderInline(title)}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const nextType = ordered ? 'ordered' : 'unordered';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      flushTextBlocks();
      output.push('<hr />');
      continue;
    }

    paragraph.push(line.trim());
  }

  if (codeLines !== null) throw new Error('Unclosed code block in the book source.');
  flushTextBlocks();
  return { html: output.join('\n'), headings };
}

function makeUuidV5(name) {
  const namespace = Buffer.from('6ba7b8109dad11d180b400c04fd430c8', 'hex');
  const hash = createHash('sha1').update(namespace).update(name).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function makeXhtml(title, body, stylesheet = 'styles.css') {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
  <title>${escapeXml(title)}</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" type="text/css" href="${stylesheet}" />
</head>
<body>
${body}
</body>
</html>`;
}

const ebookCss = `
body { margin: 0; padding: 0; color: #172b3a; font-family: serif; line-height: 1.55; }
h1, h2, h3 { color: #122a3b; font-family: sans-serif; line-height: 1.2; }
h1 { margin: 1.6em 0 .6em; font-size: 2em; }
h2 { margin: 1.8em 0 .55em; font-size: 1.45em; page-break-before: always; }
h3 { margin: 1.35em 0 .45em; font-size: 1.12em; }
p, li { margin: .45em 0; }
a { color: #087ca5; text-decoration: underline; }
blockquote { margin: 1em 0; padding: .15em 1em; border-left: .25em solid #8cb629; color: #344c5c; }
pre { white-space: pre-wrap; word-wrap: break-word; padding: .8em; background: #eef3f4; border-radius: .3em; }
code { font-family: monospace; font-size: .9em; }
hr { border: 0; border-top: 1px solid #cbd7dc; margin: 1.5em 0; }
.cover { page-break-after: always; min-height: 80vh; padding: 15vh 5vw 5vh; background: #122a3b; color: #f3f8fa; }
.cover h1 { margin-top: 2.4em; color: #fff; font-size: 2.5em; }
.cover p { color: #d4e1e7; }
.cover .eyebrow { color: #b8f22b; font: bold .8em sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.cover .subtitle { font: 1.15em/1.55 sans-serif; }
.toc { page-break-after: always; }
.toc ol { padding-left: 1.4em; }
.book-body { padding: 0 4vw; }
`;

const htmlCss = `
:root { color-scheme: light; --ink:#142a3b; --muted:#5d7180; --paper:#fffefa; --line:#dbe4e8; --green:#b8f22b; --blue:#168bb5; }
* { box-sizing:border-box; }
body { margin:0; color:var(--ink); background:#e7edf0; font:16px/1.65 Inter,"Segoe UI",Arial,sans-serif; }
a { color:#087ca5; text-underline-offset:3px; }
.book { max-width:820px; margin:32px auto; padding:44px 56px; background:var(--paper); box-shadow:0 14px 45px rgba(20,42,59,.13); }
.cover { min-height:640px; display:flex; flex-direction:column; justify-content:center; margin:-44px -56px 36px; padding:64px 56px; color:#f4fbff; background:radial-gradient(circle at 83% 16%,rgba(22,139,181,.48),transparent 28%),linear-gradient(145deg,#102433,#17384b 66%,#102433); }
.cover .eyebrow { color:var(--green); font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
.cover h1 { max-width:680px; margin:18px 0; color:white; font-size:clamp(38px,7vw,64px); line-height:1.05; letter-spacing:-.045em; }
.cover .subtitle { color:#c9dbe4; font-size:21px; }
.cover .meta { margin-top:45px; color:#a8c2ce; font-size:13px; }
.eyebrow { color:#087ca5; font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
h2 { margin:45px 0 14px; padding-top:12px; border-top:2px solid var(--green); font-size:30px; line-height:1.2; }
h3 { margin:27px 0 8px; font-size:19px; }
li { margin:6px 0; }
.toc { padding:22px 26px; border-radius:12px; background:#edf5f7; }
blockquote { margin:20px 0; padding:12px 17px; border-left:4px solid #80b817; border-radius:0 8px 8px 0; background:#f2f9df; }
pre { overflow-wrap:anywhere; padding:16px 18px; border-radius:9px; color:#e8f4f8; background:#102433; font:13px/1.55 "SFMono-Regular",Consolas,monospace; white-space:pre-wrap; }
code { padding:.1em .25em; border-radius:3px; background:#edf2f3; font: .9em "SFMono-Regular",Consolas,monospace; }
pre code { padding:0; color:inherit; background:none; }
hr { margin:35px 0; border:0; border-top:1px solid var(--line); }
.endnote { margin-top:40px; padding-top:16px; border-top:1px solid var(--line); color:var(--muted); font-size:13px; }
@media print {
  @page { size:A4; margin:18mm; }
  body { background:white; font-size:10pt; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
  .book { max-width:none; margin:0; padding:0; box-shadow:none; }
  .cover { min-height:250mm; margin:0; padding:24mm 15mm; break-after:page; }
  .toc { break-after:page; }
  h2 { break-before:page; }
  a { color:#087ca5; }
}
@media(max-width:700px) { .book{margin:0;padding:26px 22px}.cover{min-height:75vh;margin:-26px -22px 28px;padding:40px 24px}.cover h1{font-size:42px}h2{font-size:26px} }
`;

function buildDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

function buildHtmlDocument(metadata, rendered, buildDate) {
  const title = escapeHtml(metadata.title);
  const subtitle = escapeHtml(metadata.subtitle ?? '');
  const description = escapeHtml(metadata.description ?? '');
  const toc = rendered.headings
    .filter((heading) => heading.level === 2)
    .map((heading) => `<li><a href="#${heading.id}">${renderInline(heading.title)}</a></li>`)
    .join('\n');

  return `<!doctype html>
<html lang="${escapeHtml(metadata.language)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${description}" />
  <title>${title}</title>
  <style>${htmlCss}</style>
</head>
<body>
  <main class="book">
    <header class="cover">
      <p class="eyebrow">A practical publishing guide</p>
      <h1>${title}</h1>
      <p class="subtitle">${subtitle}</p>
      <p class="meta">Beginner-friendly · Updated ${escapeHtml(buildDate)}</p>
    </header>
    <nav class="toc" aria-label="Table of contents">
      <p class="eyebrow">Contents</p>
      <ol>${toc}</ol>
    </nav>
    <article class="book-body">${rendered.html}</article>
    <p class="endnote">Prepared ${escapeHtml(buildDate)}. Interface labels may change over time.</p>
  </main>
</body>
</html>`;
}

function buildNav(metadata, headings) {
  const items = headings
    .filter((heading) => heading.level === 2)
    .map((heading) => `<li><a href="content.xhtml#${heading.id}">${escapeXml(heading.title)}</a></li>`)
    .join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${escapeHtml(metadata.language)}" xml:lang="${escapeHtml(metadata.language)}">
<head><title>Contents</title><meta charset="utf-8" /></head>
<body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${items}</ol></nav></body>
</html>`;
}

function buildOpf(metadata, identifier, modified) {
  const title = escapeXml(metadata.title);
  const description = escapeXml(metadata.description ?? '');
  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${escapeHtml(metadata.language)}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${identifier}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:language>${escapeXml(metadata.language)}</dc:language>
    <dc:description>${description}</dc:description>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml" />
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="css" href="styles.css" media-type="text/css" />
  </manifest>
  <spine><itemref idref="content" /></spine>
</package>`;
}

function createEpub(metadata, rendered, buildDate) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'replit-ebook-'));
  const outputRoot = join(tempRoot, 'OEBPS');
  const textRoot = outputRoot;
  mkdirSync(join(tempRoot, 'META-INF'), { recursive: true });
  mkdirSync(textRoot, { recursive: true });
  writeFileSync(join(tempRoot, 'mimetype'), 'application/epub+zip');
  writeFileSync(
    join(tempRoot, 'META-INF/container.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" /></rootfiles>
</container>`,
  );

  const cover = `<section class="cover">
  <p class="eyebrow">A practical publishing guide</p>
  <h1>${escapeHtml(metadata.title)}</h1>
  <p class="subtitle">${escapeHtml(metadata.subtitle ?? '')}</p>
  <p>Beginner-friendly · Updated ${escapeHtml(buildDate)}</p>
</section>`;
  const contents = `<section class="toc"><h1>Contents</h1><ol>${rendered.headings
    .filter((heading) => heading.level === 2)
    .map((heading) => `<li><a href="#${heading.id}">${renderInline(heading.title)}</a></li>`)
    .join('')}</ol></section>`;
  const contentBody = `${cover}\n${contents}\n<main class="book-body">${rendered.html}</main>
<p class="endnote">Prepared ${escapeHtml(buildDate)}. Interface labels may change over time.</p>`;
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const identifier = makeUuidV5('workspace.ebook.static-site-replit-vercel-domain');

  writeFileSync(join(outputRoot, 'content.xhtml'), makeXhtml(metadata.title, contentBody, 'styles.css'));
  writeFileSync(join(outputRoot, 'nav.xhtml'), buildNav(metadata, rendered.headings));
  writeFileSync(join(outputRoot, 'content.opf'), buildOpf(metadata, identifier, modified));
  writeFileSync(join(outputRoot, 'styles.css'), ebookCss);

  rmSync(epubPath, { force: true });
  try {
    execFileSync('zip', ['-q', '-0', epubPath, 'mimetype'], { cwd: tempRoot });
    execFileSync('zip', ['-q', '-X', '-r', epubPath, 'META-INF', 'OEBPS'], { cwd: tempRoot });
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function createPdf() {
  const chromium = process.env.CHROMIUM_BIN || 'chromium';
  execFileSync(chromium, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ], { cwd: projectRoot, stdio: 'ignore' });
}

function buildEbook() {
  const source = readFileSync(sourcePath, 'utf8');
  const { metadata, markdown } = parseSource(source);
  const rendered = renderMarkdown(markdown);
  const buildDate = buildDateLabel();
  mkdirSync(join(projectRoot, 'ebooks'), { recursive: true });
  writeFileSync(htmlPath, buildHtmlDocument(metadata, rendered, buildDate));
  createEpub(metadata, rendered, buildDate);
  createPdf();
  createBookCovers(metadata, join(projectRoot, 'ebooks'));
  console.log(`Built Kindle EPUB, HTML, PDF, and cover files from ${sourcePath}`);
}

try {
  buildEbook();
} catch (error) {
  console.error('Ebook build failed:', error);
  process.exitCode = 1;
}