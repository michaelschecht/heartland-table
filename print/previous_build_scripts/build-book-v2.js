#!/usr/bin/env node
/**
 * The Heartland Table — Cookbook PDF Builder v2
 * 
 * Updated to properly handle images from centralized Images/ folder
 */

const fs = require('fs');
const path = require('path');

// === Configuration ===
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  outputDir: path.resolve(__dirname, 'output'),
  recipesDir: path.resolve(__dirname, '..', 'Recipes'),
  imagesDir: path.resolve(__dirname, '..', 'Images'),
  stylesDir: path.resolve(__dirname, 'styles'),
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

// === Simple Markdown to HTML ===
function markdownToHTML(content, recipeTitle) {
  let html = content;
  
  // Fix image paths: ../../Images/image.jpg -> ../Images/image.jpg
  // (from print/output/heartland-table.html to Images/)
  html = html.replace(/!\[(.*?)\]\(\.\.\/\.\.\/Images\/(.*?)\)/g, '![$ 1](../Images/$2)');
  
  // Convert markdown images to HTML
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="recipe-image">');
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.*$)/gm, ''); // Remove H1, we add custom title
  
  // Bold/italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code/inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Lists
  html = html.replace(/^[-*] (.*)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
  
  // Wrap consecutive list items
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
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
  html = html.replace(/(<tr>.*?<\/tr>\n?)+/g, (match) => {
    return `<table>${match}</table>`;
  });
  
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
    } else if (line.match(/^<(h[1-6]|ul|ol|table|hr|blockquote|img|div)/)) {
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
function parseRecipe(content, filename) {
  const lines = content.split('\n');
  
  let title = filename.replace('.md', '').replace(/-/g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let region = '';
  let intro = '';
  
  // Extract title from H1
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s*/, '').replace(/[🌾🧀🍳🥩🍲🍰🍞🥗🍿🥤🫙]/g, '').trim();
      break;
    }
  }
  
  // Extract region (📍 line)
  for (const line of lines) {
    if (line.includes('📍')) {
      region = line.replace(/📍|region:/gi, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
      break;
    }
  }
  
  // Extract intro (first blockquote)
  for (const line of lines) {
    if (line.startsWith('> ')) {
      intro = line.replace(/^>\s*/, '').trim();
      break;
    }
  }
  
  return {
    title,
    region,
    intro,
    content: markdownToHTML(content, title),
  };
}

// === Generate HTML ===
function generateRecipeHTML(recipe) {
  return `
<div class="recipe-page">
  <div class="recipe-header">
    <h2 class="recipe-title">${recipe.title}</h2>
    ${recipe.region ? `<div class="recipe-region">📍 ${recipe.region}</div>` : ''}
  </div>
  ${recipe.intro ? `<div class="recipe-intro">${recipe.intro}</div>` : ''}
  <div class="recipe-content">
    ${recipe.content}
  </div>
</div>
<div class="page-break"></div>
`;
}

function generateChapterPage(chapter) {
  return `
<div class="chapter-page">
  <h1 class="chapter-title">${chapter.emoji} ${chapter.title}</h1>
</div>
<div class="page-break"></div>
`;
}

function generateFullHTML(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Heartland Table — A Midwest Cookbook</title>
  <link rel="stylesheet" href="styles/cookbook.css">
  <style>
    @page {
      size: 8in 10in;
      margin: 0.5in;
    }
    
    body {
      font-family: 'Georgia', serif;
      color: #3D2B1F;
      background: #F5F0E1;
      max-width: 7in;
      margin: 0 auto;
      padding: 0.5in;
    }
    
    .recipe-page {
      page-break-after: always;
      margin-bottom: 2em;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    .chapter-page {
      page-break-after: always;
      text-align: center;
      padding: 3in 0;
      background: linear-gradient(135deg, #E8D5A3 0%, #D4A843 100%);
      margin: -0.5in -0.5in 2em -0.5in;
    }
    
    .chapter-title {
      font-size: 48pt;
      color: #3D2B1F;
      font-weight: bold;
      margin: 0;
    }
    
    .recipe-header {
      border-bottom: 3px solid #D4A843;
      padding-bottom: 0.5em;
      margin-bottom: 1em;
    }
    
    .recipe-title {
      font-size: 24pt;
      color: #A0522D;
      margin: 0 0 0.25em 0;
    }
    
    .recipe-region {
      font-size: 11pt;
      color: #8B9E82;
      font-style: italic;
    }
    
    .recipe-intro {
      font-size: 12pt;
      font-style: italic;
      color: #2C2C2C;
      margin: 1em 0;
      padding: 1em;
      background: #E8D5A3;
      border-left: 4px solid #D4A843;
    }
    
    .recipe-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5em auto;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .recipe-content {
      font-size: 11pt;
      line-height: 1.6;
    }
    
    .recipe-content h3 {
      color: #8B2252;
      font-size: 14pt;
      margin-top: 1.5em;
      border-bottom: 2px solid #D4A843;
    }
    
    .recipe-content h4 {
      color: #3D2B1F;
      font-size: 12pt;
      margin-top: 1em;
    }
    
    .recipe-content ul, .recipe-content ol {
      margin: 0.5em 0;
      padding-left: 1.5em;
    }
    
    .recipe-content li {
      margin: 0.25em 0;
    }
    
    .recipe-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    
    .recipe-content td {
      padding: 0.5em;
      border: 1px solid #D4A843;
    }
    
    .recipe-content blockquote {
      margin: 1em 0;
      padding: 1em;
      background: #F5F0E1;
      border-left: 4px solid #8B9E82;
      font-style: italic;
    }
    
    .recipe-content hr {
      border: none;
      border-top: 2px solid #D4A843;
      margin: 2em 0;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .recipe-page {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <h1 style="font-size: 60pt; text-align: center; margin-top: 3in; color: #A0522D;">The Heartland Table</h1>
    <h2 style="font-size: 24pt; text-align: center; color: #8B9E82; font-style: italic;">A Midwest Cookbook</h2>
  </div>
  <div class="page-break"></div>
  
${bodyContent}

  <div class="back-page">
    <p style="text-align: center; font-style: italic; margin-top: 4in;">
      Made with love in the Heartland 🌾
    </p>
  </div>
</body>
</html>`;
}

// === Main Build ===
async function build() {
  console.log('🌾 Building The Heartland Table (v2)...\n');
  
  // Ensure output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  let htmlContent = '';
  let totalRecipes = 0;
  
  // Process each chapter
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
    
    // Add chapter page
    htmlContent += generateChapterPage(chapter);
    
    // Add recipes
    for (const file of files) {
      const filePath = path.join(chapterDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const recipe = parseRecipe(content, file);
      htmlContent += generateRecipeHTML(recipe);
    }
  }
  
  console.log(`\n  📊 Total: ${totalRecipes} recipes\n`);
  
  // Generate full HTML
  const fullHTML = generateFullHTML(htmlContent);
  const outputPath = path.join(CONFIG.outputDir, 'heartland-table.html');
  fs.writeFileSync(outputPath, fullHTML, 'utf-8');
  console.log(`  ✅ HTML written to ${outputPath}`);
  
  // Copy stylesheet if exists
  const styleSrc = path.join(CONFIG.stylesDir, 'cookbook.css');
  const styleDest = path.join(CONFIG.outputDir, 'styles', 'cookbook.css');
  if (fs.existsSync(styleSrc)) {
    if (!fs.existsSync(path.dirname(styleDest))) {
      fs.mkdirSync(path.dirname(styleDest), { recursive: true });
    }
    fs.copyFileSync(styleSrc, styleDest);
    console.log(`  ✅ Stylesheet copied`);
  }
  
  // Generate PDF with Puppeteer
  try {
    const puppeteer = require('puppeteer');
    console.log(`\n  📄 Generating PDF...`);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(`file://${outputPath}`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    const pdfPath = path.join(CONFIG.outputDir, 'heartland-table.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      width: '8in',
      height: '10in',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });
    
    await browser.close();
    console.log(`  ✅ PDF written to ${pdfPath}`);
  } catch (err) {
    console.log(`  ⚠️  Puppeteer error: ${err.message}`);
    console.log(`     You can still open the HTML file and print to PDF manually.`);
  }
  
  console.log(`\n🌾 Build complete!`);
}

// Run
build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
