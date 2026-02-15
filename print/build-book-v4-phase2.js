#!/usr/bin/env node
/**
 * The Heartland Table — Cookbook PDF Builder v4 Phase 2
 * @date 2026-02-09
 * @version 4.1.0
 * 
 * Phase 2: Recipe Fitting
 * - Two-column ingredient lists
 * - Dynamic sizing based on recipe length
 * - Smart spacing adjustments
 * - Compact mode for longer recipes
 * - Keep recipes to single pages when possible
 */

const fs = require('fs');
const path = require('path');

// === Configuration ===
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  outputDir: path.resolve(__dirname, 'output'),
  recipesDir: path.resolve(__dirname, '..', 'Recipes'),
  imagesDir: path.resolve(__dirname, '..', 'Images'),
};

// Chapter order
const CHAPTERS = [
  { id: 'Breakfast', title: 'Breakfast & Brunch', emoji: '🍳' },
  { id: 'Appetizers', title: 'Appetizers', emoji: '🧀' },
  { id: 'Soups', title: 'Soups & Stews', emoji: '🍲' },
  { id: 'Mains', title: 'Mains', emoji: '🥩' },
  { id: 'Sides', title: 'Sides', emoji: '🥗' },
  { id: 'Breads', title: 'Breads & Baked Goods', emoji: '🍞' },
  { id: 'Desserts', title: 'Desserts', emoji: '🍰' },
  { id: 'Snacks', title: 'Snacks & Confections', emoji: '🍿' },
  { id: 'Drinks', title: 'Drinks', emoji: '🥤' },
  { id: 'Preserves', title: 'Preserves & Pickles', emoji: '🫙' },
];

// === Image to Base64 ===
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    console.log(`    ⚠️  Could not load image: ${path.basename(imagePath)}`);
    return null;
  }
}

// === Analyze Recipe Length ===
function analyzeRecipe(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const hasImage = content.includes('![');
  
  // Count ingredient lines (lines starting with - or * under Ingredients section)
  const ingredientMatches = content.match(/## Ingredients[\s\S]*?(?=##|$)/);
  let ingredientCount = 0;
  if (ingredientMatches) {
    ingredientCount = (ingredientMatches[0].match(/^[-*]/gm) || []).length;
  }
  
  // Count instruction lines
  const instructionMatches = content.match(/## (Instructions|Directions|Method)[\s\S]*?(?=##|$)/);
  let instructionCount = 0;
  if (instructionMatches) {
    instructionCount = (instructionMatches[0].match(/^\d+\./gm) || []).length;
  }
  
  const totalLength = lines.length;
  
  // Determine size category
  let size = 'medium';
  if (totalLength > 100 || instructionCount > 12) {
    size = 'large';
  } else if (totalLength < 60 && instructionCount < 8) {
    size = 'small';
  }
  
  return {
    size,
    lines: totalLength,
    hasImage,
    ingredientCount,
    instructionCount,
  };
}

// === Markdown to HTML with Two-Column Ingredients ===
function markdownToHTML(content, recipeTitle, imagesDir, recipeSize) {
  let html = content;
  
  // Find all image references and convert to base64
  html = html.replace(/!\[(.*?)\]\(\.\.\/\.\.\/Images\/(.*?)\)/g, (match, alt, filename) => {
    const imagePath = path.join(imagesDir, filename);
    const base64Data = imageToBase64(imagePath);
    
    if (base64Data) {
      // Add size class based on recipe length
      const sizeClass = recipeSize === 'large' ? 'recipe-image-compact' : 'recipe-image';
      return `<img src="${base64Data}" alt="${alt}" class="${sizeClass}">`;
    } else {
      return `<!-- Image not found: ${filename} -->`;
    }
  });
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.*$)/gm, '');
  
  // Bold/italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // TWO-COLUMN INGREDIENTS - Special handling
  // Find Ingredients section and apply two-column layout
  html = html.replace(
    /(<h3>Ingredients<\/h3>)([\s\S]*?)(?=<h3>|<h4>|$)/,
    (match, header, content) => {
      // Convert list items
      let processed = content.replace(/^[-*] (.*)$/gm, '<li>$1</li>');
      processed = processed.replace(/(<li>.*?<\/li>\n?)+/g, (items) => {
        return `<ul class="ingredients-list">${items}</ul>`;
      });
      return header + processed;
    }
  );
  
  // Regular lists (not ingredients)
  html = html.replace(/^[-*] (.*)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
    // Don't double-wrap ingredients
    if (match.includes('ingredients-list')) return match;
    return `<ul>${match}</ul>`;
  });
  
  // Blockquotes
  html = html.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');
  
  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');
  
  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map(c => `<td>${c.trim()}</td>`).join('');
    return `<tr>${cells}</tr>`;
  });
  html = html.replace(/(<tr>.*?<\/tr>\n?)+/g, (match) => `<table>${match}</table>`);
  
  // Paragraphs
  const lines = html.split('\n');
  let inBlock = false;
  const processed = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (inBlock) {
        processed.push('</p>');
        inBlock = false;
      }
    } else if (line.match(/^<(h[1-6]|ul|ol|table|hr|blockquote|img|div|!--)/)) {
      if (inBlock) {
        processed.push('</p>');
        inBlock = false;
      }
      processed.push(line);
    } else {
      if (!inBlock) {
        processed.push('<p>');
        inBlock = true;
      }
      processed.push(line);
    }
  }
  
  if (inBlock) {
    processed.push('</p>');
  }
  
  return processed.join('\n');
}

// === Parse Recipe ===
function parseRecipe(content, filename, imagesDir) {
  const lines = content.split('\n');
  
  let title = filename.replace('.md', '').replace(/-/g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let region = '';
  let intro = '';
  
  // Extract title
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s*/, '').replace(/[🌾🧀🍳🥩🍲🍰🍞🥗🍿🥤🫙]/g, '').trim();
      break;
    }
  }
  
  // Extract region
  for (const line of lines) {
    if (line.includes('📍')) {
      region = line.replace(/📍|region:/gi, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
      break;
    }
  }
  
  // Extract intro
  for (const line of lines) {
    if (line.startsWith('> ')) {
      intro = line.replace(/^>\s*/, '').trim();
      break;
    }
  }
  
  // Analyze recipe for smart sizing
  const analysis = analyzeRecipe(content);
  
  return {
    title,
    region,
    intro,
    size: analysis.size,
    content: markdownToHTML(content, title, imagesDir, analysis.size),
  };
}

// === Generate HTML ===
function generateRecipeHTML(recipe, chapterTitle) {
  const sizeClass = recipe.size === 'large' ? 'recipe-compact' : '';
  
  return `
<div class="recipe-page ${sizeClass}" data-chapter="${chapterTitle}">
  <div class="recipe-header">
    <h2 class="recipe-title">${recipe.title}</h2>
    ${recipe.region ? `<div class="recipe-region">📍 ${recipe.region}</div>` : ''}
  </div>
  ${recipe.intro ? `<div class="recipe-intro">${recipe.intro}</div>` : ''}
  <div class="recipe-content">
    ${recipe.content}
  </div>
</div>
`;
}

function generateChapterPage(chapter) {
  return `
<div class="chapter-page" data-chapter="${chapter.title}">
  <h1 class="chapter-title">${chapter.emoji} ${chapter.title}</h1>
</div>
`;
}

function generateFullHTML(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Heartland Table — A Midwest Cookbook</title>
  <style>
    /* === PAGE SETUP === */
    @page {
      size: 8in 10in;
      margin: 0.75in 0.75in 1in 0.75in;
      
      @top-center {
        content: string(chapter-name);
        font-family: 'Georgia', serif;
        font-size: 9pt;
        color: #8B9E82;
        font-style: italic;
      }
      
      @bottom-center {
        content: counter(page);
        font-family: 'Georgia', serif;
        font-size: 9pt;
        color: #3D2B1F;
      }
    }
    
    @page chapter-page {
      @top-center { content: none; }
      @bottom-center { content: none; }
    }
    
    @page :first {
      @top-center { content: none; }
      @bottom-center { content: none; }
    }
    
    /* === BODY === */
    body {
      font-family: 'Georgia', serif;
      color: #3D2B1F;
      background: #FFFEF9;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      counter-reset: page;
    }
    
    /* === COVER PAGE === */
    .cover-page {
      page: cover-page;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #F5F0E1 0%, #E8D5A3 100%);
      page-break-after: always;
    }
    
    .cover-title {
      font-size: 60pt;
      color: #A0522D;
      margin: 0;
      font-weight: bold;
      letter-spacing: 2px;
    }
    
    .cover-subtitle {
      font-size: 24pt;
      color: #8B9E82;
      font-style: italic;
      margin: 1em 0 0 0;
    }
    
    /* === CHAPTER PAGES === */
    .chapter-page {
      page: chapter-page;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #E8D5A3 0%, #D4A843 100%);
      page-break-after: always;
      page-break-before: always;
    }
    
    .chapter-title {
      font-size: 48pt;
      color: #3D2B1F;
      font-weight: bold;
      margin: 0;
      string-set: chapter-name content();
    }
    
    /* === RECIPE PAGES === */
    .recipe-page {
      page-break-before: always;
      page-break-after: always;
      page-break-inside: avoid;
      min-height: 7.5in;
    }
    
    .recipe-page[data-chapter] {
      string-set: chapter-name attr(data-chapter);
    }
    
    /* PHASE 2: COMPACT MODE for longer recipes */
    .recipe-page.recipe-compact {
      font-size: 9.5pt;
      line-height: 1.45;
    }
    
    .recipe-page.recipe-compact .recipe-title {
      font-size: 20pt;
      margin-bottom: 0.15em;
    }
    
    .recipe-page.recipe-compact .recipe-intro {
      font-size: 10pt;
      padding: 0.6em;
      margin: 0.6em 0;
    }
    
    .recipe-page.recipe-compact .recipe-content h3 {
      font-size: 12pt;
      margin-top: 1em;
      margin-bottom: 0.3em;
    }
    
    .recipe-page.recipe-compact .recipe-content p {
      margin: 0.3em 0;
    }
    
    .recipe-header {
      border-bottom: 3px solid #D4A843;
      padding-bottom: 0.4em;
      margin-bottom: 0.8em;
      page-break-after: avoid;
    }
    
    .recipe-title {
      font-size: 22pt;
      color: #A0522D;
      margin: 0 0 0.2em 0;
      page-break-after: avoid;
    }
    
    .recipe-region {
      font-size: 10pt;
      color: #8B9E82;
      font-style: italic;
    }
    
    .recipe-intro {
      font-size: 11pt;
      font-style: italic;
      color: #2C2C2C;
      margin: 0.8em 0;
      padding: 0.8em;
      background: #F5F0E1;
      border-left: 4px solid #D4A843;
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    
    /* PHASE 2: Image sizing based on recipe length */
    .recipe-image {
      max-width: 5in;
      height: auto;
      display: block;
      margin: 1em auto;
      border-radius: 6px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.15);
      page-break-inside: avoid;
      page-break-before: avoid;
    }
    
    .recipe-image-compact {
      max-width: 4in;
      height: auto;
      display: block;
      margin: 0.8em auto;
      border-radius: 6px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.15);
      page-break-inside: avoid;
      page-break-before: avoid;
    }
    
    /* === RECIPE CONTENT === */
    .recipe-content {
      font-size: 10.5pt;
      line-height: 1.55;
    }
    
    .recipe-content h3 {
      color: #8B2252;
      font-size: 13pt;
      margin-top: 1.2em;
      margin-bottom: 0.4em;
      border-bottom: 2px solid #D4A843;
      padding-bottom: 0.2em;
      page-break-after: avoid;
    }
    
    .recipe-content h4 {
      color: #3D2B1F;
      font-size: 11pt;
      margin-top: 0.8em;
      margin-bottom: 0.3em;
      page-break-after: avoid;
    }
    
    /* PHASE 2: TWO-COLUMN INGREDIENTS LIST */
    .ingredients-list {
      column-count: 2;
      column-gap: 1.5em;
      margin: 0.5em 0 1em 0;
      padding-left: 1.5em;
      page-break-inside: avoid;
    }
    
    .ingredients-list li {
      margin: 0.25em 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Regular lists (instructions, etc.) */
    .recipe-content ul:not(.ingredients-list),
    .recipe-content ol {
      margin: 0.4em 0;
      padding-left: 1.5em;
    }
    
    .recipe-content li {
      margin: 0.25em 0;
      page-break-inside: avoid;
    }
    
    .recipe-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8em 0;
      page-break-inside: avoid;
    }
    
    .recipe-content td {
      padding: 0.4em;
      border: 1px solid #D4A843;
    }
    
    .recipe-content blockquote {
      margin: 0.8em 0;
      padding: 0.8em;
      background: #F5F0E1;
      border-left: 4px solid #8B9E82;
      font-style: italic;
      page-break-inside: avoid;
    }
    
    .recipe-content hr {
      border: none;
      border-top: 2px solid #D4A843;
      margin: 1.5em 0;
    }
    
    .recipe-content p {
      margin: 0.4em 0;
      orphans: 3;
      widows: 3;
    }
    
    /* === BACK PAGE === */
    .back-page {
      page-break-before: always;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-style: italic;
      color: #8B9E82;
    }
    
    /* === PRINT MEDIA === */
    @media print {
      body {
        background: white;
      }
      
      .recipe-page {
        page-break-before: always;
        page-break-after: always;
        page-break-inside: avoid;
      }
      
      .recipe-header,
      .recipe-intro,
      .recipe-content h3,
      .recipe-content h4 {
        page-break-after: avoid;
      }
      
      .recipe-image,
      .recipe-image-compact,
      .ingredients-list,
      .recipe-content ul,
      .recipe-content ol,
      .recipe-content blockquote,
      .recipe-content table {
        page-break-inside: avoid;
      }
      
      .ingredients-list li {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <h1 class="cover-title">The Heartland Table</h1>
    <h2 class="cover-subtitle">A Midwest Cookbook</h2>
  </div>
  
${bodyContent}

  <div class="back-page">
    <p>Made with love in the Heartland 🌾</p>
  </div>
</body>
</html>`;
}

// === Main Build ===
async function build() {
  console.log('🌾 Building The Heartland Table (v4.1 - Phase 2: Recipe Fitting)...\n');
  
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  let htmlContent = '';
  let totalRecipes = 0;
  let totalImages = 0;
  let recipeSizes = { small: 0, medium: 0, large: 0 };
  
  for (const chapter of CHAPTERS) {
    const chapterDir = path.join(CONFIG.recipesDir, chapter.id);
    
    if (!fs.existsSync(chapterDir)) {
      continue;
    }
    
    const files = fs.readdirSync(chapterDir)
      .filter(f => f.endsWith('.md') && !f.startsWith('.') && !f.toLowerCase().includes('update'))
      .sort();
    
    if (files.length === 0) continue;
    
    console.log(`  📁 ${chapter.title}: ${files.length} recipes`);
    totalRecipes += files.length;
    
    htmlContent += generateChapterPage(chapter);
    
    for (const file of files) {
      const filePath = path.join(chapterDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Count images
      const imageMatches = content.match(/!\[.*?\]\(.*?\.jpg\)/g);
      if (imageMatches) {
        totalImages += imageMatches.length;
      }
      
      const recipe = parseRecipe(content, file, CONFIG.imagesDir);
      recipeSizes[recipe.size]++;
      htmlContent += generateRecipeHTML(recipe, chapter.title);
    }
  }
  
  console.log(`\n  📊 Total: ${totalRecipes} recipes`);
  console.log(`  🖼️  Images embedded: ${totalImages}`);
  console.log(`\n  📏 Recipe sizing:`);
  console.log(`     Small (compact): ${recipeSizes.small}`);
  console.log(`     Medium (normal): ${recipeSizes.medium}`);
  console.log(`     Large (fitted): ${recipeSizes.large}`);
  console.log(`\n  ✨ Phase 2 features:`);
  console.log(`     ✅ Two-column ingredient lists`);
  console.log(`     ✅ Dynamic sizing for longer recipes`);
  console.log(`     ✅ Compact images for long recipes`);
  console.log(`     ✅ Smart spacing adjustments`);
  console.log(`     ✅ Single-page optimization\n`);
  
  const fullHTML = generateFullHTML(htmlContent);
  const outputPath = path.join(CONFIG.outputDir, 'heartland-table.html');
  fs.writeFileSync(outputPath, fullHTML, 'utf-8');
  console.log(`  ✅ HTML written to ${outputPath}`);
  
  // Generate PDF with Puppeteer
  try {
    const puppeteer = require('puppeteer');
    console.log(`\n  📄 Generating PDF (Phase 2 layout)...`);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(`file://${outputPath}`, {
      waitUntil: 'networkidle0',
      timeout: 120000
    });
    
    const pdfPath = path.join(CONFIG.outputDir, 'heartland-table.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      width: '8in',
      height: '10in',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '1in',
        left: '0.75in'
      }
    });
    
    await browser.close();
    
    const stats = fs.statSync(pdfPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`  ✅ PDF written to ${pdfPath} (${sizeMB} MB)`);
    console.log(`\n🌾 Phase 2 complete! Most recipes now fit on single pages.\n`);
    console.log(`  📋 Next: Phase 3 (table of contents, index, final polish)\n`);
  } catch (err) {
    console.log(`  ⚠️  Puppeteer error: ${err.message}`);
  }
}

// Run
build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
