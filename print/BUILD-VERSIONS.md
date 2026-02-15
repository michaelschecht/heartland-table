# Heartland Table Cookbook - Build Versions

## Version History

### v5.3 (February 9, 2026) - ✅ RECOMMENDED (Wide Ingredients)
**Script:** `build-book-v5.js`  
**Status:** Working - **Ingredients Span 90% of Sidebar Width**  
**Method:** Base64 images + Wide ingredient text + Narrow sidebar  
**Output Size:** ~157 MB PDF  
**Total Pages:** 178 (2 pages per recipe)  

**Layout Design:**
- **Page 1:** Full hero image, title, region, and description
- **Page 2:** Narrow ingredients sidebar (left) + Instructions (right)

**Key Optimizations (v5.3):**
- ✅ **Wide ingredients** - Text spans 90% of sidebar width (not squished in center!)
- ✅ **Minimal sidebar padding** - 0.05in L/R (was 0.25in)
- ✅ **Narrow sidebar** - 1.25in total width
- ✅ **Narrower margins** - 0.375in L/R page margins
- ✅ **Left-aligned ingredients** - Full width usage
- ✅ **Tighter typography** - 8-8.5pt fonts
- ✅ **Tighter line spacing** - 1.3
- ✅ **Maximum content space**

**What's Fixed:**
- ❌ v5.2: Ingredients squished in center of sidebar with lots of empty space
- ✅ v5.3: Ingredients span almost the entire sidebar width (90%)

**Recipe Count:**
- 89 recipes × 2 pages = 178 pages
- Page 1: Visual/intro (hero image, title, description)
- Page 2: Working recipe (wide ingredients sidebar + instructions)

**How to build:**
```bash
cd print/
node build-book-v5.js
```

**Output:**
- `output/heartland-table.pdf` (157 MB) - Wide ingredients layout
- `output/heartland-table.html` (136 MB) - Web version

---

### v5.2 (February 9, 2026) - ⚠️ SUPERSEDED (Ingredients Squished)
**Script:** `build-book-v5.js`  
**Status:** Working - **Maximum Content Area**  
**Method:** Base64 images + Narrow sidebar + Narrower margins  
**Output Size:** ~157 MB PDF  
**Total Pages:** 178 (2 pages per recipe)  

**Layout Design:**
- **Page 1:** Full hero image, title, region, and description
- **Page 2:** Narrow ingredients sidebar (left) + Instructions (right)

**Key Optimizations (v5.2):**
- ✅ **Narrow sidebar** - 1.25in (was 2.5in) - 50% reduction
- ✅ **Narrower margins** - 0.375in L/R (was 0.75in) - 50% reduction
- ✅ **Left-aligned ingredients** - Full sidebar width (not centered)
- ✅ **Tighter typography** - 8-8.5pt fonts (was 9.5pt)
- ✅ **Tighter line spacing** - 1.3 (was 1.35)
- ✅ **Smaller step badges** - 1.3em (was 1.5em)
- ✅ **Reduced grid gap** - 0.5in (was 0.75in)
- ✅ **Maximum content space** - More room for recipe content

**Key Features:**
- ✅ Professional two-page spreads
- ✅ Numbered instruction steps with circular badges
- ✅ Magazine-style layout (hero page + working page)
- ✅ Grid-based design optimized for single-page fit
- ✅ All 89 images embedded
- ✅ Running headers with chapter names
- ✅ Page numbers

**Recipe Count:**
- 89 recipes × 2 pages = 178 pages
- Page 1: Visual/intro (hero image, title, description)
- Page 2: Working recipe (narrow sidebar + instructions)

**How to build:**
```bash
cd print/
node build-book-v5.js
```

**Output:**
- `output/heartland-table.pdf` (157 MB) - Maximum content space layout
- `output/heartland-table.html` (136 MB) - Web version

**Issue:** Ingredients squished in center of sidebar with empty space on sides  
**Why superseded:** v5.3 makes ingredients span 90% of sidebar width

---

### v5.1 (February 9, 2026) - ⚠️ SUPERSEDED (Incorrect Margins)
**Script:** `build-book-v5.js` (superseded version)  
**Status:** Superseded by v5.2  
**Issue:** Margins increased instead of decreased (1.125in instead of 0.375in)  
**Why superseded:** v5.2 has correct narrower margins for maximum content space

---

### v5.0 (February 9, 2026) - ⚠️ SUPERSEDED (Initial Two-Page)
**Script:** `build-book-v5.js` (superseded version)  
**Status:** Superseded by v5.2  
**Issue:** Sidebar too wide (2.5in), ingredients centered  
**Why superseded:** v5.2 has narrower sidebar, narrower margins, left-aligned ingredients

---

### v4.1 (February 9, 2026) - ⚠️ SUPERSEDED (Single-Page Optimization)
**Script:** `build-book-v4-phase2.js`  
**Status:** Superseded by v5.0  
**Features:** Single-page layout with two-column ingredients  
**Why superseded:** v5.0 has cleaner two-page design with sidebar

---

### v4.0 (February 9, 2026) - ⚠️ SUPERSEDED (Phase 1 Only)
**Script:** `build-book-v4.js`  
**Status:** Superseded by v4.1 and v5.0  
**Features:** Page control without recipe fitting

---

### v3.0 (February 8, 2026) - ⚠️ DEPRECATED
**Script:** `build-book-v3.js`  
**Status:** Images work but layout superseded  
**Method:** Base64 embedding without layout optimization

---

### v2.0 (February 8, 2026) - ⚠️ DEPRECATED
**Script:** `build-book-v2.js`  
**Status:** Images don't display in PDF  
**Issue:** Puppeteer path resolution failed

---

### v1.0 (February 7, 2026) - ⚠️ DEPRECATED
**Script:** `build-book.js`  
**Status:** Images don't display  
**Issue:** Path resolution failed

---

## Recommended: Use v5.3

**To generate the complete cookbook:**

```bash
# From the cookbook directory
cd flavor-atlas/cookbooks/cookbooks/Heartland-Table/print

# Make sure dependencies are installed
npm install

# Run the latest build script
node build-book-v5.js
```

**Output location:**
```
print/output/heartland-table.pdf    (158 MB - two-page layout)
print/output/heartland-table.html   (136 MB - web version)
```

---

## What's New in v5.3

### Two-Page Design Philosophy
Each recipe gets a **professional magazine-style spread**:

#### Page 1 - The Hero
- Large, beautiful food photo
- Recipe title in elegant typography
- Regional origin badge
- Descriptive intro/story

#### Page 2 - The Recipe (WIDE INGREDIENTS)
- **Left Sidebar (1.25 inches):**
  - Ingredients list - **SPANS 90% OF SIDEBAR WIDTH**
  - **No longer squished in center!**
  - Minimal padding (0.05in L/R) for maximum text width
  - Clean, bulleted format
  - Cream background
  - Gold accent border
  - Compact 8pt font

- **Right Column (Maximum Width):**
  - Numbered instructions with circular badges
  - Compact 8.5pt font
  - Tighter line spacing (1.3)
  - Additional sections (Notes, Tips, etc.)
  - **Much more horizontal space** for instructions

### Space Optimization (v5.3 Updates)
- **Sidebar width:** 1.25in total
- **Sidebar padding:** 0.05in L/R (was 0.25in) - **80% reduction**
- **Ingredient text width:** ~90% of sidebar (was ~50%)
- **Page margins:** 0.375in L/R
- **Line spacing:** 1.3
- **Fonts:** 8-8.5pt
- **Grid gap:** 0.5in

### Visual Flow
- Hero page sets the mood
- Working page **maximizes content space**
- **Ingredients use full sidebar width** (not centered/squished)
- Narrow sidebar keeps ingredients visible without wasting space
- Instructions have **maximum horizontal room**
- **Narrower margins** = more space for recipe content

---

## File Size Note

The v5.3 PDF is 157 MB due to base64-encoded images. This is necessary to ensure images display correctly in the PDF.

**GitHub limitations:**
- PDF files >100 MB cannot be committed to GitHub
- The PDF should be generated locally or stored elsewhere
- The build script and all recipe files ARE committed to GitHub
- Anyone can generate the complete PDF by running `node build-book-v5.js`

---

## Contents

- **89 recipes** across 10 sections
- **178 pages** (2 per recipe)
- **All images** embedded and displaying
- **Professional two-page spreads**
- **8" × 10" format**

---

## Building from Source

1. Clone the repository
2. Navigate to `flavor-atlas/cookbooks/cookbooks/Heartland-Table/print`
3. Run `npm install` (first time only)
4. Run `node build-book-v5.js`
5. Find your PDF in `output/heartland-table.pdf`

The complete cookbook with all images and two-page layout will be generated locally.
