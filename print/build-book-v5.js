#!/usr/bin/env node
/**
 * The Heartland Table — Cookbook PDF Builder v5
 * @date 2026-02-09
 * @version 5.5.0
 * 
 * Two-Page Layout (v5.5):
 * - Cover: Beautiful cover photo
 * - Page 1: Hero image, title, description
 * - Page 2: Wider ingredients sidebar (1.56in, left-aligned) | Instructions (right)
 * - Clean MD formatting (no ***, **, ###, --)
 * - Capitalized section titles (At a Glance, Did You Know?)
 * - Proper table rendering with headers
 * - No indentation on section titles
 * - Professional magazine-style layout
 */

const fs = require('fs');
const path = require('path');

// === Configuration ===
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  outputDir: path.resolve(__dirname, 'output'),
  recipesDir: path.resolve(__dirname, '..', 'Recipes'),
  imagesDir: path.resolve(__dirname, '..', 'Images'),
  coverDir: path.resolve(__dirname, '..', 'Cover'),
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

// === Convert Markdown Table to HTML ===
function convertMarkdownTable(lines) {
  if (lines.length < 3) return null; // Need header, separator, and at least one data row
  
  // Check if this looks like a markdown table
  const hasTableSyntax = lines.some(line => line.includes('|'));
  if (!hasTableSyntax) return null;
  
  const rows = lines.filter(line => line.trim().startsWith('|'));
  if (rows.length < 2) return null;
  
  // First row is header
  const headerRow = rows[0];
  const headers = headerRow.split('|').filter(cell => cell.trim()).map(cell => {
    // Remove markdown formatting from headers
    return cell.trim().replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
  });
  
  // Skip separator row (second row with dashes)
  // Data rows start from index 2
  const dataRows = rows.slice(2);
  
  let tableHTML = '<table class="recipe-table">\n<thead>\n<tr>\n';
  headers.forEach(header => {
    tableHTML += `<th>${header}</th>\n`;
  });
  tableHTML += '</tr>\n</thead>\n<tbody>\n';
  
  dataRows.forEach(row => {
    const cells = row.split('|').filter(cell => cell.trim()).map(cell => {
      // Remove markdown formatting from cells (***Servings*** → Servings)
      return cell.trim().replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
    });
    tableHTML += '<tr>\n';
    cells.forEach(cell => {
      tableHTML += `<td>${cell}</td>\n`;
    });
    tableHTML += '</tr>\n';
  });
  
  tableHTML += '</tbody>\n</table>';
  return tableHTML;
}

// === Capitalize section title ===
function capitalizeTitle(title) {
  // Capitalize first letter of each word
  return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// === Parse Recipe Content ===
function parseRecipeContent(content) {
  const sections = {};
  let currentSection = 'intro';
  sections[currentSection] = [];
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect section headers
    if (line.match(/^## Ingredients?$/i)) {
      currentSection = 'ingredients';
      sections[currentSection] = [];
    } else if (line.match(/^## (Instructions?|Directions?|Method|Steps?)$/i)) {
      currentSection = 'instructions';
      sections[currentSection] = [];
    } else if (line.match(/^## /)) {
      // Other sections (Notes, Tips, etc.)
      const sectionName = line.replace(/^##\s*/, '').trim();
      currentSection = capitalizeTitle(sectionName);
      sections[currentSection] = [];
    } else if (line.trim()) {
      // Clean up markdown formatting
      let cleanedLine = line
        .replace(/^###\s*/, '')  // Remove ### from subsection headers
        .replace(/^--+\s*$/, '')  // Remove -- separators
        .trim();
      
      if (cleanedLine) {
        sections[currentSection].push(cleanedLine);
      }
    }
  }
  
  return sections;
}

// === Parse Recipe ===
function parseRecipe(content, filename, imagesDir) {
  const lines = content.split('\n');
  
  let title = filename.replace('.md', '').replace(/-/g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let region = '';
  let intro = '';
  let imageData = null;
  
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
  
  // Extract intro (blockquote)
  for (const line of lines) {
    if (line.startsWith('> ')) {
      intro = line.replace(/^>\s*/, '').trim();
      break;
    }
  }
  
  // Extract image
  const imageMatch = content.match(/!\[(.*?)\]\(\.\.\/\.\.\/Images\/(.*?)\)/);
  if (imageMatch) {
    const imagePath = path.join(imagesDir, imageMatch[2]);
    imageData = imageToBase64(imagePath);
  }
  
  // Parse content sections
  const sections = parseRecipeContent(content);
  
  return {
    title,
    region,
    intro,
    image: imageData,
    ingredients: sections.ingredients || [],
    instructions: sections.instructions || [],
    otherSections: Object.keys(sections).filter(k => !['intro', 'ingredients', 'instructions'].includes(k)).map(k => ({
      name: k,
      content: sections[k]
    }))
  };
}

// === Generate Recipe HTML (Two-Page Layout) ===
function generateRecipeHTML(recipe, chapterTitle) {
  // Page 1: Hero image, title, intro
  const page1 = `
<div class="recipe-hero-page" data-chapter="${chapterTitle}">
  ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" class="hero-image">` : ''}
  <div class="hero-content">
    <h2 class="hero-title">${recipe.title}</h2>
    ${recipe.region ? `<div class="hero-region">📍 ${recipe.region}</div>` : ''}
    ${recipe.intro ? `<div class="hero-intro">${recipe.intro}</div>` : ''}
  </div>
</div>
`;

  // Page 2: Ingredients (sidebar) + Instructions (main)
  const ingredientsHTML = recipe.ingredients.map(line => {
    // Clean up markdown formatting from ingredients
    let cleaned = line
      .replace(/^[-*]\s*/, '')  // Remove list markers
      .replace(/\*\*\*/g, '')   // Remove ***
      .replace(/\*\*/g, '')     // Remove **
      .replace(/\*/g, '');      // Remove *
    return `<li>${cleaned}</li>`;
  }).join('\n');
  
  const instructionsHTML = recipe.instructions.map((line, idx) => {
    let cleaned = line.replace(/^\d+\.\s*/, '');
    
    // Handle **Par-cook the potatoes.** format
    // Remove the ** and make the first sentence bold
    const sentenceMatch = cleaned.match(/^\*\*(.*?)\*\*/);
    if (sentenceMatch) {
      const boldPart = sentenceMatch[1];
      const rest = cleaned.substring(sentenceMatch[0].length);
      cleaned = `<strong>${boldPart}</strong>${rest}`;
    } else {
      // Remove any remaining ** formatting
      cleaned = cleaned.replace(/\*\*/g, '');
    }
    
    return `<div class="instruction-step"><span class="step-number">${idx + 1}</span><p>${cleaned}</p></div>`;
  }).join('\n');
  
  const otherSectionsHTML = recipe.otherSections.map(section => {
    // Try to convert markdown tables to HTML tables
    const tableHTML = convertMarkdownTable(section.content);
    
    let content;
    if (tableHTML) {
      content = tableHTML;
    } else {
      // Clean up markdown formatting from content
      content = section.content.map(line => {
        let cleaned = line.replace(/\*\*/g, '');  // Remove **
        return `<p>${cleaned}</p>`;
      }).join('\n');
    }
    
    return `<div class="recipe-section"><h4>${section.name}</h4>${content}</div>`;
  }).join('\n');
  
  const page2 = `
<div class="recipe-detail-page" data-chapter="${chapterTitle}">
  <div class="sidebar">
    <h3>Ingredients</h3>
    <ul class="ingredients-list">
      ${ingredientsHTML}
    </ul>
  </div>
  <div class="main-content">
    <h3>Instructions</h3>
    <div class="instructions">
      ${instructionsHTML}
    </div>
    ${otherSectionsHTML}
  </div>
</div>
`;

  return page1 + page2;
}

function generateChapterPage(chapter) {
  return `
<div class="chapter-page" data-chapter="${chapter.title}">
  <h1 class="chapter-title">${chapter.emoji} ${chapter.title}</h1>
</div>
`;
}

function generateFullHTML(bodyContent, coverImageData) {
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
      margin: 0.375in 0.375in 1in 0.375in;
      
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
      line-height: 1.35;  /* SIGNIFICANTLY TIGHTER */
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
    
    .cover-image {
      max-width: 6in;
      max-height: 7in;
      width: auto;
      height: auto;
      margin-bottom: 1em;
      border-radius: 10px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
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
    
    /* === RECIPE HERO PAGE (Page 1) === */
    .recipe-hero-page {
      page-break-before: always;
      page-break-after: always;
      page-break-inside: avoid;
      min-height: 8in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    
    .recipe-hero-page[data-chapter] {
      string-set: chapter-name attr(data-chapter);
    }
    
    .hero-image {
      max-width: 6.5in;
      max-height: 5.5in;
      width: auto;
      height: auto;
      display: block;
      margin: 0 auto 1.5em auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .hero-content {
      max-width: 6in;
      margin: 0 auto;
    }
    
    .hero-title {
      font-size: 32pt;
      color: #A0522D;
      margin: 0 0 0.3em 0;
      font-weight: bold;
      line-height: 1.2;
    }
    
    .hero-region {
      font-size: 11pt;
      color: #8B9E82;
      font-style: italic;
      margin-bottom: 1em;
    }
    
    .hero-intro {
      font-size: 12pt;
      font-style: italic;
      color: #2C2C2C;
      line-height: 1.5;
      padding: 1em 1.5em;
      background: #F5F0E1;
      border-left: 4px solid #D4A843;
      text-align: left;
    }
    
    /* === RECIPE DETAIL PAGE (Page 2) === */
    .recipe-detail-page {
      page-break-before: always;
      page-break-after: always;
      page-break-inside: avoid;
      display: grid;
      grid-template-columns: 1.56in 1fr;
      grid-gap: 0.5in;
      min-height: 8in;
    }
    
    .recipe-detail-page[data-chapter] {
      string-set: chapter-name attr(data-chapter);
    }
    
    /* SIDEBAR (Ingredients) */
    .sidebar {
      background: #F5F0E1;
      padding: 0.3in 0.025in;
      border-right: 3px solid #D4A843;
      text-align: left;
    }
    
    .sidebar h3 {
      font-size: 11pt;
      color: #8B2252;
      margin: 0 0.025in 0.4em 0.025in;
      border-bottom: 2px solid #D4A843;
      padding-bottom: 0.2em;
      text-align: left;
    }
    
    .ingredients-list {
      list-style: none;
      padding: 0 0.025in;
      margin: 0;
      font-size: 8pt;
      line-height: 1.25;
      text-align: left;
      width: auto;
    }
    
    .ingredients-list li {
      margin: 0.25em 0;
      padding-left: 0.6em;
      padding-right: 0.025in;
      position: relative;
      text-align: left;
      word-wrap: break-word;
      hyphens: auto;
    }
    
    .ingredients-list li:before {
      content: "•";
      position: absolute;
      left: 0.025in;
      color: #D4A843;
      font-weight: bold;
    }
    
    /* MAIN CONTENT (Instructions) */
    .main-content {
      padding: 0.4in 0;
    }
    
    .main-content h3 {
      font-size: 11pt;
      color: #8B2252;
      margin: 0 0 0.4em 0;
      border-bottom: 2px solid #D4A843;
      padding-bottom: 0.2em;
    }
    
    .instructions {
      font-size: 8.5pt;
      line-height: 1.3;
    }
    
    .instruction-step {
      display: flex;
      margin: 0.3em 0;
      page-break-inside: avoid;
    }
    
    .step-number {
      flex-shrink: 0;
      width: 1.3em;
      height: 1.3em;
      background: #D4A843;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 7pt;
      margin-right: 0.4em;
      margin-top: 0.1em;
    }
    
    .instruction-step p {
      margin: 0;
      flex: 1;
    }
    
    .recipe-section {
      margin-top: 1em;
      padding-top: 0.75em;
      border-top: 1px solid #E8D5A3;
    }
    
    .recipe-section h4 {
      font-size: 11pt;
      color: #3D2B1F;
      margin: 0 0 0.4em 0;
      text-indent: 0;
      padding-left: 0;
    }
    
    .recipe-section p {
      font-size: 9pt;
      line-height: 1.35;
      margin: 0.3em 0;
    }
    
    /* === TABLES (At a Glance, etc.) === */
    .recipe-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5em 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    
    .recipe-table thead {
      background: #D4A843;
    }
    
    .recipe-table th {
      padding: 0.4em 0.5em;
      text-align: left;
      font-weight: bold;
      color: #3D2B1F;
      border: 1px solid #B8902A;
    }
    
    .recipe-table td {
      padding: 0.3em 0.5em;
      background: #F5F0E1;
      border: 1px solid #D4A843;
    }
    
    .recipe-table tr:nth-child(even) td {
      background: #F9F6EA;
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
      
      .recipe-hero-page,
      .recipe-detail-page {
        page-break-before: always;
        page-break-after: always;
        page-break-inside: avoid;
      }
      
      .instruction-step,
      .ingredients-list li {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    ${coverImageData ? `<img src="${coverImageData}" alt="The Heartland Table" class="cover-image">` : ''}
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
  console.log('🌾 Building The Heartland Table (v5.5 - Clean Formatting)...\n');
  
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Load cover photo
  let coverImageData = null;
  const coverPhotoPath = path.join(CONFIG.coverDir, 'cover_photo.png');
  if (fs.existsSync(coverPhotoPath)) {
    coverImageData = imageToBase64(coverPhotoPath);
    console.log('  📸 Cover photo loaded\n');
  }
  
  let htmlContent = '';
  let totalRecipes = 0;
  let totalImages = 0;
  
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
      if (content.includes('![')) {
        totalImages++;
      }
      
      const recipe = parseRecipe(content, file, CONFIG.imagesDir);
      htmlContent += generateRecipeHTML(recipe, chapter.title);
    }
  }
  
  console.log(`\n  📊 Total: ${totalRecipes} recipes (${totalRecipes * 2} pages)`);
  console.log(`  🖼️  Images embedded: ${totalImages}`);
  console.log(`\n  ✨ v5.5 Two-Page Layout (Clean Formatting):`);
  console.log(`     ✅ Cover photo embedded`);
  console.log(`     ✅ Capitalized section titles (At A Glance, Did You Know?)`);
  console.log(`     ✅ Clean MD formatting (no ***, **, ###, --)`);
  console.log(`     ✅ Tables: removed *** from cells`);
  console.log(`     ✅ Instructions: bold first sentence`);
  console.log(`     ✅ No indentation on section titles`);
  console.log(`     ✅ Professional formatting throughout\n`);
  
  const fullHTML = generateFullHTML(htmlContent, coverImageData);
  const outputPath = path.join(CONFIG.outputDir, 'heartland-table.html');
  fs.writeFileSync(outputPath, fullHTML, 'utf-8');
  console.log(`  ✅ HTML written to ${outputPath}`);
  
  // Generate PDF with Puppeteer
  try {
    const puppeteer = require('puppeteer');
    console.log(`\n  📄 Generating PDF (this may take 2-3 minutes)...`);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(300000);
    page.setDefaultTimeout(300000);
    
    await page.goto(`file://${outputPath}`, {
      waitUntil: 'networkidle0',
      timeout: 300000
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
        top: '0.375in',
        right: '0.375in',
        bottom: '1in',
        left: '0.375in'
      }
    });
    
    await browser.close();
    
    const stats = fs.statSync(pdfPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`  ✅ PDF written to ${pdfPath} (${sizeMB} MB)`);
    console.log(`\n🌾 v5.5 Complete! Clean formatting with cover photo.\n`);
  } catch (err) {
    console.log(`  ⚠️  Puppeteer error: ${err.message}`);
    console.log(`     HTML is ready - use generate-pdf-manual.sh to create PDF\n`);
  }
}

// Run
build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
