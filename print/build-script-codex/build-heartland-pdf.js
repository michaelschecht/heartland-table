#!/usr/bin/env node
/**
 * Heartland Table Themed PDF Builder
 *
 * Source HTML default:
 *   artifacts/Heartland_Table/heartland-table.html
 *
 * Usage:
 *   node build-heartland-pdf.js --list-themes
 *   node build-heartland-pdf.js --theme=heritage-ledger
 *   node build-heartland-pdf.js --theme=prairie-modern --output=heartland-table-prairie-modern.pdf
 *   node build-heartland-pdf.js --input="file:///D:/AI_Agents/Specialized_Agents/mike_codex/artifacts/Heartland_Table/heartland-table.html"
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const THEMES = {
  'heritage-ledger': {
    label: 'Heritage Ledger',
    bodyBg: '#FCF8F1',
    ink: '#2F241C',
    display: '#7A3424',
    accent: '#B6872D',
    accentSoft: '#E7D6B1',
    panel: '#F5EBD5',
    edge: '#C8A56C',
    mute: '#6B7F6A',
    chapterGradientA: '#E5C78C',
    chapterGradientB: '#C79245',
    quoteBg: '#F8F1E3',
    quoteEdge: '#B6872D',
    bullet: '•',
  },
  'prairie-modern': {
    label: 'Prairie Modern',
    bodyBg: '#F3F7F6',
    ink: '#1F2A2A',
    display: '#1A4E4F',
    accent: '#2F8A84',
    accentSoft: '#D6ECE7',
    panel: '#ECF5F2',
    edge: '#8BB8B0',
    mute: '#4D6A67',
    chapterGradientA: '#9ED2CA',
    chapterGradientB: '#4B8D86',
    quoteBg: '#EAF4F2',
    quoteEdge: '#2F8A84',
    bullet: '◆',
  },
  'farmhouse-press': {
    label: 'Farmhouse Press',
    bodyBg: '#FAF7F2',
    ink: '#2A211B',
    display: '#4B3D2E',
    accent: '#8F5D2D',
    accentSoft: '#EADFCF',
    panel: '#F3ECE2',
    edge: '#B99977',
    mute: '#6F655A',
    chapterGradientA: '#DDC9B4',
    chapterGradientB: '#B58A62',
    quoteBg: '#F2E8DC',
    quoteEdge: '#8F5D2D',
    bullet: '▪',
  },
  'midnight-supper-club': {
    label: 'Midnight Supper Club',
    bodyBg: '#F7F4EF',
    ink: '#221B1A',
    display: '#3B2A5C',
    accent: '#A46CC3',
    accentSoft: '#E4D6EE',
    panel: '#F0E8F5',
    edge: '#C2A3D5',
    mute: '#5B4E66',
    chapterGradientA: '#D8C3E6',
    chapterGradientB: '#AB82C8',
    quoteBg: '#EEE4F4',
    quoteEdge: '#A46CC3',
    bullet: '●',
  },
};

function parseArgs(argv) {
  const args = {
    theme: 'heritage-ledger',
    input: '',
    outDir: path.resolve(__dirname, '..'),
    output: '',
    listThemes: false,
  };

  for (const token of argv) {
    if (token === '--list-themes') args.listThemes = true;
    else if (token.startsWith('--theme=')) args.theme = token.split('=')[1].trim();
    else if (token.startsWith('--input=')) args.input = token.slice('--input='.length).trim();
    else if (token.startsWith('--out-dir=')) args.outDir = token.slice('--out-dir='.length).trim();
    else if (token.startsWith('--output=')) args.output = token.slice('--output='.length).trim();
  }

  return args;
}

function resolveInput(inputArg) {
  const defaultLocalPath = path.resolve(__dirname, 'heartland-table.html');

  if (!inputArg) {
    if (!fs.existsSync(defaultLocalPath)) {
      throw new Error(`Default input file not found: ${defaultLocalPath}`);
    }
    return { url: pathToFileURL(defaultLocalPath).href, localPath: defaultLocalPath };
  }

  if (/^file:\/\//i.test(inputArg)) {
    return { url: inputArg, localPath: null };
  }

  const fullPath = path.resolve(inputArg);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Input file not found: ${fullPath}`);
  }
  return { url: pathToFileURL(fullPath).href, localPath: fullPath };
}

function buildThemeCss(theme) {
  return `
  body {
    font-family: "Georgia", "Garamond", "Palatino Linotype", serif !important;
    color: ${theme.ink} !important;
    background: ${theme.bodyBg} !important;
  }

  .cover-title,
  .hero-title,
  .chapter-title,
  .about-page h1,
  .toc h1 {
    color: ${theme.display} !important;
  }

  .chapter-page {
    background: linear-gradient(135deg, ${theme.chapterGradientA} 0%, ${theme.chapterGradientB} 100%) !important;
  }

  .hero-region,
  .author-info,
  .contributors,
  .toc-chapter-title,
  .toc-recipes,
  .back-page {
    color: ${theme.mute} !important;
  }

  .hero-intro,
  .sidebar,
  .recipe-table td,
  .about-page,
  .toc {
    background: ${theme.panel} !important;
  }

  .hero-intro {
    border-left-color: ${theme.quoteEdge} !important;
    background: ${theme.quoteBg} !important;
  }

  .sidebar,
  .main-content h3,
  .sidebar h3,
  .recipe-section,
  .toc-chapter-title,
  .about-page h1 {
    border-color: ${theme.edge} !important;
  }

  .main-content h3,
  .sidebar h3,
  .recipe-section h4 {
    color: ${theme.display} !important;
  }

  .step-number {
    background: ${theme.accent} !important;
    color: #fff !important;
  }

  .ingredients-list li:before {
    content: "${theme.bullet}" !important;
    color: ${theme.accent} !important;
  }

  .recipe-table thead,
  .recipe-table th {
    background: ${theme.accentSoft} !important;
  }

  .recipe-table th,
  .recipe-table td {
    border-color: ${theme.edge} !important;
    color: ${theme.ink} !important;
  }
  `;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.listThemes) {
    console.log('Available themes:');
    Object.entries(THEMES).forEach(([key, t]) => console.log(`  - ${key}: ${t.label}`));
    return;
  }

  const theme = THEMES[args.theme];
  if (!theme) {
    throw new Error(`Unknown theme "${args.theme}". Use --list-themes.`);
  }

  const { url: inputUrl, localPath } = resolveInput(args.input);

  if (!fs.existsSync(args.outDir)) {
    fs.mkdirSync(args.outDir, { recursive: true });
  }

  const outputFileName = args.output || `heartland-table-${args.theme}.pdf`;
  const outputPath = path.join(args.outDir, outputFileName);

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (err) {
    throw new Error(
      'Missing dependency "puppeteer". Install with: npm install puppeteer'
    );
  }

  console.log(`Theme: ${theme.label}`);
  console.log(`Input: ${localPath || inputUrl}`);
  console.log(`Output: ${outputPath}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(600000);
    page.setDefaultTimeout(600000);

    await page.goto(inputUrl, { waitUntil: 'networkidle0', timeout: 600000 });
    await page.addStyleTag({ content: buildThemeCss(theme) });
    await page.emulateMediaType('print');
    await new Promise((resolve) => setTimeout(resolve, 1200));

    await page.pdf({
      path: outputPath,
      width: '8in',
      height: '10in',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '0.375in',
        right: '0.375in',
        bottom: '1in',
        left: '0.375in',
      },
      preferCSSPageSize: true,
    });

    const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
    console.log(`Done: ${outputPath} (${sizeMB} MB)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`Build failed: ${err.message}`);
  process.exit(1);
});
