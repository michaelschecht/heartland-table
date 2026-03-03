# Heartland Table - Pandoc Build System

Professional cookbook PDF generation using Pandoc + LaTeX.

## 🚀 Quick Start

### Build the cookbook:
```bash
./build-cookbook.sh
```

Output will be in `output/heartland-table.pdf`

### Quick rebuild (shortcut):
```bash
./quick-build.sh
```

## 📋 Prerequisites

Already installed ✅:
- `pandoc` - Document converter
- `texlive-xetex` - XeLaTeX engine for PDF generation
- `fonts-liberation` - Liberation fonts

## 📁 Directory Structure

```
build-script-pandoc/
├── build-cookbook.sh       # Main build script
├── quick-build.sh          # Quick rebuild shortcut
├── metadata.yaml           # Book metadata (title, author, styling)
├── README.md              # This file
├── output/                # Generated PDFs appear here
│   └── heartland-table.pdf
└── temp/                  # Temporary build files (auto-cleaned)
```

## 🛠️ How It Works

The build script:
1. **Gathers recipes** from `/Recipes/` organized by category:
   - Breakfast
   - Breads
   - Appetizers
   - Soups
   - Mains
   - Sides
   - Desserts
   - Drinks
   - Snacks
   - Preserves

2. **Adds special sections** from `/special-sections/`

3. **Includes the cover image** from `/Cover/cover_photo.png`

4. **Generates PDF** with:
   - Professional typography (Georgia serif)
   - Table of contents
   - Chapter headings
   - Recipe formatting
   - Image support
   - Page breaks between recipes

## 📝 Customization

### Edit Book Metadata
Open `metadata.yaml` to change:
- Title, subtitle, author
- Page size and margins
- Fonts and colors
- Table of contents settings

### Modify Build Order
Edit the `CATEGORIES` array in `build-cookbook.sh` to change chapter order.

### Styling
The LaTeX template in `metadata.yaml` under `header-includes` controls:
- Colors (defined as `heartlandrust`, `heartlandsage`, `heartlandgold`)
- Headers and footers
- Spacing and margins

## 🎨 Output Specifications

- **Format:** PDF
- **Page Size:** 8" × 10" (standard cookbook size)
- **Margins:** 0.75" all around (0.25" binding offset)
- **Font:** Georgia 11pt
- **Features:** 
  - Clickable table of contents
  - Page numbers
  - Chapter headers in headers
  - Color links

## 🔧 Troubleshooting

### LaTeX Errors
If you see LaTeX compilation errors:
1. Check that all image paths are correct
2. Look for special characters in markdown that need escaping
3. Check the temp files in `temp/` before they're cleaned up

### Keep Temp Files
To debug, edit `build-cookbook.sh` and comment out:
```bash
# rm -rf "$TEMP_DIR"
```

### Missing Fonts
Install additional fonts:
```bash
sudo apt install texlive-fonts-extra fonts-liberation2
```

## 📊 Build Output

After building, you'll see:
- ✅ Success confirmation
- 📖 Output file path
- 📏 File size
- 📄 Page count

## 🎯 Next Steps

### For Print-on-Demand:
The generated PDF is ready for services like:
- Lulu
- Amazon KDP
- IngramSpark
- Blurb

### For E-Book:
Generate ePub:
```bash
pandoc metadata.yaml temp/*.md -o output/heartland-table.epub
```

### For Web:
Generate HTML:
```bash
pandoc metadata.yaml temp/*.md -o output/heartland-table.html --toc --standalone
```

## 💡 Tips

1. **Test with one category first** - Comment out categories in the script
2. **Check image sizes** - Large images increase PDF size
3. **Preview frequently** - Rebuild after major changes
4. **Version your PDFs** - Copy output with date suffix for history

## 🐛 Debugging

### Verbose output:
```bash
bash -x ./build-cookbook.sh
```

### Check Pandoc version:
```bash
pandoc --version
```

### Check LaTeX installation:
```bash
xelatex --version
```

## 📚 Resources

- [Pandoc Manual](https://pandoc.org/MANUAL.html)
- [LaTeX Cookbook Templates](https://www.overleaf.com/gallery/tagged/cookbook)
- [XeLaTeX Guide](https://www.overleaf.com/learn/latex/XeLaTeX)

---

**Built with ❤️ for The Heartland Table**
