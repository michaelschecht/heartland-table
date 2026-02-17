#!/usr/bin/env node
/**
 * The Heartland Table — Cookbook PDF Builder
 * 
 * Reads all recipe markdown files, converts to HTML, and generates a print-ready PDF.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// === Configuration ===
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  outputDir: path.resolve(__dirname, 'output'),
  recipesDir: path.resolve(__dirname, '..', 'Recipes'),
  specialDir: path.resolve(__dirname, '..', 'special-sections'),
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

// Special sections
const SPECIAL_SECTIONS = [
  { file: 'hotdish-vs-casserole.md', title: 'Hotdish vs. Casserole: The Great Debate', emoji: '🥊' },
  { file: 'midwest-nice-rating-guide.md', title: 'The Midwest Nice Rating™ Guide', emoji: '🫕' },
  { file: 'midwest-measurement-system.md', title: 'The Midwest Measurement System', emoji: '📏' },
  { file: 'state-rivalry-trash-talk.md', title: 'State Rivalry Trash Talk', emoji: '🗣️' },
  { file: 'midwest-bingo.md', title: 'Midwest Potluck Bingo', emoji: '🎰' },
  { file: 'will-it-hotdish.md', title: 'Will It Hotdish?', emoji: '🧪' },
  { file: 'grandmas-secret-ingredients.md', title: "Grandma's Secret Ingredients", emoji: '👵' },
  { file: 'pairs-well-with.md', title: 'Pairs Well With...', emoji: '🍺' },
  { file: 'cooking-playlist.md', title: 'The Heartland Cooking Playlist', emoji: '🎵' },
];

// === Markdown Parser (Enhanced) ===
function parseRecipeMarkdown(content) {
  const recipe = {
    title: '',
    region: '',
    intro: '',
    prepTime: '',
    cookTime: '',
    serves: '',
    midwestNice: 3,
    ingredients: [],
    instructions: [],
    grandmaSecret: '',
    pairsWith: '',
    didYouKnow: '',
    tips: [],
  };

  const lines = content.split('\n');
  let currentSection = '';
  let inAtAGlance = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Title (first H1)
    if (line.startsWith('# ') && !recipe.title) {
      recipe.title = line.replace(/^#\s*/, '').replace(/[🌾🧀🍳🥩🍲🍰🍞🥗🍿🥤🫙]/g, '').trim();
      continue;
    }
    
    // Region (📍 line)
    if (line.includes('📍') || (line.startsWith('*') && line.includes('—') && i < 10)) {
      recipe.region = line.replace(/📍|region:/gi, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
      continue;
    }
    
    // Detect At a Glance section
    if (line.toLowerCase().includes('at a glance')) {
      inAtAGlance = true;
      currentSection = '';
      continue;
    }
    
    // Parse At a Glance table rows
    if (inAtAGlance && line.includes('|')) {
      const cells = line.split('|').map(c => c.replace(/\*\*/g, '').trim());
      for (const cell of cells) {
        const lower = cell.toLowerCase();
        if (lower.includes('prep')) {
          const nextCell = cells[cells.indexOf(cell) + 1];
          if (nextCell) {
            const match = nextCell.match(/(\d+)\s*(min|hour|hr|minutes|hours)/i);
            if (match) recipe.prepTime = `${match[1]} min`;
          }
        }
        if (lower.includes('cook')) {
          const nextCell = cells[cells.indexOf(cell) + 1];
          if (nextCell) {
            const match = nextCell.match(/(\d+)/);
            if (match) recipe.cookTime = `${match[1]} min`;
          }
        }
        if (lower.includes('serv') || lower.includes('yield')) {
          const nextCell = cells[cells.indexOf(cell) + 1];
          if (nextCell) {
            const match = nextCell.match(/(\d+[-–]\d+|\d+)/);
            if (match) recipe.serves = match[1];
          }
        }
      }
      continue;
    }
    
    // End At a Glance on section break
    if (inAtAGlance && line.startsWith('---')) {
      inAtAGlance = false;
      continue;
    }
    
    // Inline time parsing (backup)
    if (line.toLowerCase().includes('prep time:') || line.toLowerCase().includes('prep:')) {
      const match = line.match(/(\d+)\s*(min|hour|hr|minutes|hours)/i);
      if (match && !recipe.prepTime) recipe.prepTime = `${match[1]} min`;
    }
    if (line.toLowerCase().includes('cook time:') || line.toLowerCase().includes('cook:')) {
      const match = line.match(/(\d+)/);
      if (match && !recipe.cookTime) recipe.cookTime = `${match[1]} min`;
    }
    if ((line.toLowerCase().includes('serves:') || line.toLowerCase().includes('servings')) && !line.includes('|')) {
      const match = line.match(/(\d+[-–]\d+|\d+)/);
      if (match && !recipe.serves) recipe.serves = match[1];
    }
    if (line.includes('🫕') || line.toLowerCase().includes('midwest nice')) {
      const stars = (line.match(/★/g) || []).length || (line.match(/⭐/g) || []).length || (line.match(/🫕/g) || []).length;
      if (stars) recipe.midwestNice = Math.min(stars, 5);
    }
    
    // Section headers
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const header = line.replace(/^#+\s*/, '').toLowerCase();
      if (header.includes('ingredient')) currentSection = 'ingredients';
      else if (header.includes('instruction') || header.includes('direction')) currentSection = 'instructions';
      else if (header.includes('grandma') || header.includes('secret')) currentSection = 'grandma';
      else if (header.includes('pairs') || header.includes('with')) currentSection = 'pairs';
      else if (header.includes('did you know') || header.includes('about')) currentSection = 'didyouknow';
      else if (header.includes('tip') || header.includes('variation')) currentSection = 'tips';
      else currentSection = '';
      inAtAGlance = false;
      continue;
    }
    
    // Intro (blockquote at start)
    if (line.startsWith('>') && !recipe.intro && i < 20) {
      recipe.intro = line.replace(/^>\s*/, '').trim();
      continue;
    }
    
    // Content by section
    if (currentSection === 'ingredients' && line.startsWith('-')) {
      recipe.ingredients.push(line.replace(/^-\s*/, ''));
    }
    if (currentSection === 'instructions' && /^\d+\./.test(line)) {
      recipe.instructions.push(line.replace(/^\d+\.\s*/, ''));
    }
    if (currentSection === 'grandma' && line && !line.startsWith('#') && !line.startsWith('---')) {
      recipe.grandmaSecret += (recipe.grandmaSecret ? ' ' : '') + line;
    }
    if (currentSection === 'pairs' && line && !line.startsWith('#') && !line.startsWith('---')) {
      recipe.pairsWith += (recipe.pairsWith ? ' ' : '') + line;
    }
    if (currentSection === 'didyouknow' && line && !line.startsWith('#') && !line.startsWith('---') && !line.startsWith('*📸')) {
      recipe.didYouKnow += (recipe.didYouKnow ? ' ' : '') + line;
    }
    if (currentSection === 'tips' && line.startsWith('-')) {
      recipe.tips.push(line.replace(/^-\s*/, ''));
    }
  }
  
  return recipe;
}

// === HTML Generators ===
function generateMidwestNiceRating(rating) {
  const filled = '🫕'.repeat(rating);
  const empty = '○'.repeat(5 - rating);
  return `<span class="midwest-nice-rating">${filled}${empty}</span>`;
}

function generateRecipeHTML(recipe, imagePath = null) {
  const ingredientsList = recipe.ingredients
    .map(ing => `<li>${ing}</li>`)
    .join('\n');
  
  const instructionsList = recipe.instructions
    .map((inst, i) => `<li>${inst}</li>`)
    .join('\n');
  
  const imageHTML = imagePath 
    ? `<img src="${imagePath}" alt="${recipe.title}" class="recipe-image">`
    : '';
  
  const grandmaHTML = recipe.grandmaSecret 
    ? `<div class="grandma-secret">
        <div class="grandma-secret-title">Grandma's Secret</div>
        <p>${recipe.grandmaSecret.replace(/\*\*/g, '')}</p>
      </div>`
    : '';
  
  const pairsHTML = recipe.pairsWith
    ? `<div class="pairs-well-with"><strong>Pairs well with:</strong> ${recipe.pairsWith}</div>`
    : '';
  
  const didYouKnowHTML = recipe.didYouKnow
    ? `<div class="did-you-know"><strong>🌾 Did You Know?</strong> ${recipe.didYouKnow.substring(0, 300)}${recipe.didYouKnow.length > 300 ? '...' : ''}</div>`
    : '';

  // Create anchor slug from recipe title
  const slug = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return `
<article class="recipe-page" id="recipe-${slug}">
  <header class="recipe-header">
    <h2 class="recipe-title">${recipe.title}</h2>
    <span class="recipe-region">📍 ${recipe.region || 'The Midwest'}</span>
  </header>
  
  ${recipe.intro ? `<p class="recipe-intro">"${recipe.intro}"</p>` : ''}
  
  ${imageHTML}
  
  <div class="at-a-glance">
    <div class="at-a-glance-item">
      <span class="at-a-glance-label">Prep</span>
      <span class="at-a-glance-value">${recipe.prepTime || '—'}</span>
    </div>
    <div class="at-a-glance-item">
      <span class="at-a-glance-label">Cook</span>
      <span class="at-a-glance-value">${recipe.cookTime || '—'}</span>
    </div>
    <div class="at-a-glance-item">
      <span class="at-a-glance-label">Serves</span>
      <span class="at-a-glance-value">${recipe.serves || '—'}</span>
    </div>
    <div class="at-a-glance-item">
      <span class="at-a-glance-label">Midwest Nice</span>
      <span class="at-a-glance-value">${generateMidwestNiceRating(recipe.midwestNice)}</span>
    </div>
  </div>
  
  <div class="recipe-content">
    <div class="ingredients">
      <h3>Ingredients</h3>
      <ul>${ingredientsList}</ul>
    </div>
    
    <div class="instructions">
      <h3>Instructions</h3>
      <ol>${instructionsList}</ol>
    </div>
  </div>
  
  ${grandmaHTML}
  ${didYouKnowHTML}
  ${pairsHTML}
</article>
`;
}

function generateChapterOpener(chapter, recipeCount, chapterNum) {
  return `
<div class="chapter-opener" id="chapter-${chapter.id}">
  <div class="chapter-number">${chapter.emoji}</div>
  <h1 class="chapter-title">${chapter.title}</h1>
  <div class="chapter-count">${recipeCount} Recipes</div>
</div>
`;
}

function generateTitlePage() {
  // Full-page cover image without text overlay
  return `
<div class="cover-page">
  <img src="../Cover/cover_photo.png" alt="The Heartland Table Cover" class="cover-image" />
</div>
`;
}

function parseSpecialSection(content, title, emoji) {
  // Simple markdown to HTML conversion
  let html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^# (.*$)/gm, '') // Remove title, we add our own
    // Bold/italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr>')
    // Tables (basic)
    .replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Clean up
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h|<ul|<ol|<hr|<blockquote|<table)/g, '$1')
    .replace(/(<\/h\d>|<\/ul>|<\/ol>|<hr>|<\/blockquote>|<\/table>)<\/p>/g, '$1');

  return `
<div class="special-section">
  <h2>${emoji} ${title}</h2>
  <div class="special-content">
    <p>${html}</p>
  </div>
</div>
`;
}

function generateTOC(chapters, recipes) {
  let tocHTML = '<div class="toc"><h1>Table of Contents</h1>';
  let pageNum = 5; // Start after front matter
  
  for (const chapter of chapters) {
    const chapterRecipes = recipes.filter(r => r.chapter === chapter.id);
    if (chapterRecipes.length === 0) continue;
    
    tocHTML += `<div class="toc-chapter">`;
    tocHTML += `<a href="#chapter-${chapter.id}" class="toc-chapter-title">${chapter.emoji} ${chapter.title}</a>`;
    tocHTML += `<ul class="toc-recipes">`;
    
    for (const recipe of chapterRecipes) {
      // Create a slug from the recipe title for the anchor
      const slug = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      tocHTML += `<li><a href="#recipe-${slug}"><span>${recipe.title}</span><span class="dots"></span><span>${pageNum}</span></a></li>`;
      pageNum++;
    }
    
    tocHTML += `</ul></div>`;
    pageNum++; // Chapter opener page
  }
  
  tocHTML += '</div>';
  return tocHTML;
}

function generateFullHTML(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Heartland Table — A Mid-West Cookbook</title>
  <link rel="stylesheet" href="styles/cookbook.css">
</head>
<body>
${content}
</body>
</html>`;
}

// === Main Build ===
async function build() {
  console.log('🌾 Building The Heartland Table...\n');
  
  // Ensure output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Collect all recipes
  const allRecipes = [];
  
  for (const chapter of CHAPTERS) {
    const chapterDir = path.join(CONFIG.recipesDir, chapter.id);
    if (!fs.existsSync(chapterDir)) {
      console.log(`  ⚠️  No directory for ${chapter.id}`);
      continue;
    }
    
    const files = fs.readdirSync(chapterDir).filter(f => f.endsWith('.md'));
    console.log(`  📁 ${chapter.title}: ${files.length} recipes`);
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(chapterDir, file), 'utf8');
      const recipe = parseRecipeMarkdown(content);
      recipe.chapter = chapter.id;
      recipe.file = file;
      allRecipes.push(recipe);
    }
  }
  
  console.log(`\n  📊 Total: ${allRecipes.length} recipes\n`);
  
  // Build HTML
  let bookHTML = '';
  
  // Title page
  bookHTML += generateTitlePage();
  
  // Copyright page
  bookHTML += `
<div class="page-break"></div>
<div style="display:flex;flex-direction:column;justify-content:flex-end;min-height:100%;font-family:var(--font-ui);font-size:0.8rem;color:var(--muted-sage);">
  <p><strong>The Heartland Table: A Mid-West Cookbook</strong></p>
  <p>© 2026. All rights reserved.</p>
  <p>Built collaboratively by AI agents on the AX Platform.</p>
  <p style="margin-top:1rem;">First Edition</p>
</div>
`;
  
  // Table of Contents
  bookHTML += generateTOC(CHAPTERS, allRecipes);
  
  // Chapters
  for (let i = 0; i < CHAPTERS.length; i++) {
    const chapter = CHAPTERS[i];
    const chapterRecipes = allRecipes.filter(r => r.chapter === chapter.id);
    if (chapterRecipes.length === 0) continue;
    
    // Chapter opener
    bookHTML += generateChapterOpener(chapter, chapterRecipes.length, i + 1);
    
    // Recipes
    for (const recipe of chapterRecipes) {
      // Check for image
      const imgName = recipe.file.replace('.md', '.jpg');
      const imgPath = path.join(CONFIG.imagesDir, imgName);
      const hasImage = fs.existsSync(imgPath);
      
      bookHTML += generateRecipeHTML(recipe, hasImage ? `../Images/${imgName}` : null);
    }
  }
  
  // Special Sections
  bookHTML += `
<div class="chapter-opener">
  <div class="chapter-number">✨</div>
  <h1 class="chapter-title">Special Features</h1>
  <div class="chapter-count">The Fun Stuff</div>
</div>
`;
  
  for (const section of SPECIAL_SECTIONS) {
    const sectionPath = path.join(CONFIG.specialDir, section.file);
    if (fs.existsSync(sectionPath)) {
      const content = fs.readFileSync(sectionPath, 'utf8');
      bookHTML += parseSpecialSection(content, section.title, section.emoji);
      console.log(`  📄 Added special section: ${section.title}`);
    } else {
      console.log(`  ⚠️  Missing special section: ${section.file}`);
    }
  }
  
  // Write HTML
  const fullHTML = generateFullHTML(bookHTML);
  const htmlPath = path.join(CONFIG.outputDir, 'heartland-table.html');
  fs.writeFileSync(htmlPath, fullHTML);
  console.log(`  ✅ HTML written to ${htmlPath}`);
  
  // Copy stylesheet
  const stylesDir = path.join(CONFIG.outputDir, 'styles');
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
  }
  fs.copyFileSync(
    path.join(__dirname, 'styles', 'cookbook.css'),
    path.join(stylesDir, 'cookbook.css')
  );
  console.log(`  ✅ Stylesheet copied`);
  
  // Generate PDF using Puppeteer (if available)
  try {
    const puppeteer = require('puppeteer');
    console.log('\n  📄 Generating PDF...');
    
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: path.join(CONFIG.outputDir, 'heartland-table.pdf'),
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', bottom: '0.75in', left: '0.625in', right: '0.625in' }
    });
    
    await browser.close();
    console.log(`  ✅ PDF written to ${path.join(CONFIG.outputDir, 'heartland-table.pdf')}`);
  } catch (e) {
    console.log(`  ⚠️  Puppeteer not available. Run 'npm install puppeteer' then re-run to generate PDF.`);
    console.log(`     Or open ${htmlPath} in a browser and print to PDF.`);
  }
  
  console.log('\n🌾 Build complete!\n');
}

build().catch(console.error);
