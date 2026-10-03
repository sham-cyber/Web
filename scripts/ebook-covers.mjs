import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapWords(value, maxCharacters) {
  const lines = [];
  let line = '';
  for (const word of value.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function coverSvg(metadata, width, height, maxTitleCharacters) {
  const titleLines = wrapWords(metadata.title.toUpperCase(), maxTitleCharacters);
  const subtitleLines = wrapWords(metadata.subtitle ?? '', 47);
  const titleSize = Math.min(width * 0.074, (height * 0.31) / (titleLines.length * 1.17));
  const titleLineHeight = titleSize * 1.17;
  const titleStart = height * 0.215;
  const subtitleSize = width * 0.026;
  const subtitleLineHeight = height * 0.029;
  const subtitleStart = Math.max(
    height * 0.53,
    titleStart + titleLineHeight * titleLines.length + height * 0.018,
  );
  const panelX = width * 0.09;
  const panelY = height * 0.69;
  const panelWidth = width * 0.82;
  const panelHeight = height * 0.19;
  const titleMarkup = titleLines
    .map((line, index) => `<text x="${width * 0.085}" y="${titleStart + titleLineHeight * index}" class="title">${escapeXml(line)}</text>`)
    .join('\n');
  const subtitleMarkup = subtitleLines
    .map((line, index) => `<text x="${width * 0.09}" y="${subtitleStart + subtitleLineHeight * index}" class="subtitle">${escapeXml(line)}</text>`)
    .join('\n');
  const steps = [
    { name: 'REPLIT', detail: 'BUILD', accent: true },
    { name: 'GITHUB', detail: 'SAVE', accent: false },
    { name: 'VERCEL', detail: 'PUBLISH', accent: false },
    { name: 'YOUR DOMAIN', detail: 'CONNECT', accent: false },
  ];
  const centers = steps.map((_, index) => panelX + panelWidth * (0.13 + index * 0.246));
  const flowY = panelY + panelHeight * 0.61;
  const stepsMarkup = steps.map((step, index) => {
    const cx = centers[index];
    const color = step.accent ? '#b8f22b' : '#48b7d9';
    return `<g>
      <circle cx="${cx}" cy="${flowY}" r="${width * 0.016}" fill="${color}" />
      <circle cx="${cx}" cy="${flowY}" r="${width * 0.027}" fill="none" stroke="${color}" stroke-opacity=".28" stroke-width="${width * 0.002}" />
      <text x="${cx}" y="${flowY + width * 0.062}" text-anchor="middle" class="step">${step.name}</text>
      <text x="${cx}" y="${flowY + width * 0.087}" text-anchor="middle" class="detail">${step.detail}</text>
    </g>`;
  }).join('\n');
  const connectorsMarkup = centers.slice(0, -1).map((cx, index) => (
    `<line x1="${cx + width * 0.029}" y1="${flowY}" x2="${centers[index + 1] - width * 0.029}" y2="${flowY}" stroke="#4f7381" stroke-width="${width * 0.002}" />`
  )).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="cover-title cover-description">
  <title id="cover-title">${escapeXml(metadata.title)}</title>
  <desc id="cover-description">${escapeXml(metadata.subtitle ?? '')}</desc>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c1d2a" />
      <stop offset=".58" stop-color="#153749" />
      <stop offset="1" stop-color="#102432" />
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="#168bb5" stop-opacity=".55" />
      <stop offset="1" stop-color="#168bb5" stop-opacity="0" />
    </radialGradient>
    <pattern id="dots" width="${width * 0.025}" height="${width * 0.025}" patternUnits="userSpaceOnUse">
      <circle cx="${width * 0.003}" cy="${width * 0.003}" r="${width * 0.0012}" fill="#a8d4e0" fill-opacity=".2" />
    </pattern>
    <style>
      .eyebrow { fill: #b8f22b; font: 700 ${width * 0.016}px Arial, Helvetica, sans-serif; letter-spacing: ${width * 0.002}px; }
      .title { fill: #f5fbfd; font: 800 ${titleSize}px Arial, Helvetica, sans-serif; letter-spacing: ${-titleSize * 0.045}px; }
      .subtitle { fill: #d1e1e7; font: 400 ${subtitleSize}px Arial, Helvetica, sans-serif; }
      .panel-heading { fill: #a9c5d0; font: 700 ${width * 0.014}px Arial, Helvetica, sans-serif; letter-spacing: ${width * 0.0016}px; }
      .step { fill: #f5fbfd; font: 700 ${width * 0.016}px Arial, Helvetica, sans-serif; letter-spacing: ${width * 0.0003}px; }
      .detail { fill: #a9c5d0; font: 400 ${width * 0.012}px Arial, Helvetica, sans-serif; letter-spacing: ${width * 0.001}px; }
      .footer { fill: #91aebb; font: 700 ${width * 0.012}px Arial, Helvetica, sans-serif; letter-spacing: ${width * 0.0012}px; }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#background)" />
  <rect width="${width}" height="${height}" fill="url(#dots)" opacity=".46" />
  <circle cx="${width * 0.88}" cy="${height * 0.17}" r="${width * 0.28}" fill="url(#glow)" />
  <path d="M ${width * 0.76} ${height * 0.07} C ${width * 0.91} ${height * 0.12}, ${width * 0.77} ${height * 0.29}, ${width * 1.04} ${height * 0.34}" fill="none" stroke="#49b8d9" stroke-opacity=".16" stroke-width="${width * 0.002}" />
  <path d="M ${width * 0.79} ${height * 0.04} C ${width * 0.96} ${height * 0.1}, ${width * 0.82} ${height * 0.27}, ${width * 1.02} ${height * 0.29}" fill="none" stroke="#b8f22b" stroke-opacity=".16" stroke-width="${width * 0.0015}" />
  <rect x="${width * 0.085}" y="${height * 0.088}" width="${width * 0.052}" height="${width * 0.004}" rx="${width * 0.002}" fill="#b8f22b" />
  <text x="${width * 0.15}" y="${height * 0.095}" class="eyebrow">A PRACTICAL PUBLISHING GUIDE</text>
  ${titleMarkup}
  ${subtitleMarkup}
  <rect x="${panelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="${width * 0.022}" fill="#0b202d" fill-opacity=".8" stroke="#71909c" stroke-opacity=".28" stroke-width="${width * 0.0015}" />
  <text x="${panelX + width * 0.035}" y="${panelY + panelHeight * 0.23}" class="panel-heading">FROM FIRST FILE TO LIVE DOMAIN</text>
  ${connectorsMarkup}
  ${stepsMarkup}
  <line x1="${width * 0.09}" y1="${height * 0.925}" x2="${width * 0.91}" y2="${height * 0.925}" stroke="#9cb5bf" stroke-opacity=".28" stroke-width="${width * 0.001}" />
  <text x="${width * 0.09}" y="${height * 0.953}" class="footer">STATIC SITES · BEGINNER FRIENDLY</text>
  <text x="${width * 0.91}" y="${height * 0.953}" text-anchor="end" class="footer">REPLIT · GITHUB · VERCEL</text>
</svg>`;
}

function printHtml(svg) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: 6in 9in; margin: 0; }
    html, body { width: 6in; height: 9in; margin: 0; padding: 0; overflow: hidden; }
    svg { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>${svg}</body>
</html>`;
}

export function createBookCovers(metadata, outputDirectory) {
  const kindleSvg = coverSvg(metadata, 1600, 2560, 16);
  const paperbackSvg = coverSvg(metadata, 1800, 2700, 17);
  const kindleSvgPath = join(outputDirectory, 'kindle-cover.svg');
  const kindleJpgPath = join(outputDirectory, 'kindle-cover.jpg');
  const paperbackSvgPath = join(outputDirectory, 'paperback-front-cover.svg');
  const paperbackPdfPath = join(outputDirectory, 'paperback-front-cover.pdf');
  writeFileSync(kindleSvgPath, kindleSvg);
  writeFileSync(paperbackSvgPath, paperbackSvg);

  const magick = process.env.MAGICK_BIN || 'magick';
  execFileSync(magick, [
    kindleSvgPath,
    '-resize',
    '1600x2560!',
    '-background',
    '#102432',
    '-alpha',
    'remove',
    '-alpha',
    'off',
    '-strip',
    '-quality',
    '92',
    kindleJpgPath,
  ], { stdio: 'ignore' });

  const tempRoot = mkdtempSync(join(tmpdir(), 'ebook-cover-'));
  try {
    const htmlPath = join(tempRoot, 'paperback-front-cover.html');
    writeFileSync(htmlPath, printHtml(paperbackSvg));
    const chromium = process.env.CHROMIUM_BIN || 'chromium';
    execFileSync(chromium, [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-pdf-header-footer',
      `--print-to-pdf=${paperbackPdfPath}`,
      pathToFileURL(htmlPath).href,
    ], { stdio: 'ignore' });
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}