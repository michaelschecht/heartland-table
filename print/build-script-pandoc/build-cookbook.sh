#!/bin/bash

# ========================================
# Heartland Table - Pandoc Build Script
# ========================================

set -e  # Exit on error

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$SCRIPT_DIR/../.."
RECIPES_DIR="$REPO_ROOT/Recipes"
SPECIAL_DIR="$REPO_ROOT/special-sections"
IMAGES_DIR="$REPO_ROOT/Images"
COVER_IMAGE="$REPO_ROOT/Cover/cover_photo.png"
OUTPUT_DIR="$SCRIPT_DIR/output"
TEMP_DIR="$SCRIPT_DIR/temp"

# Output file
OUTPUT_PDF="$OUTPUT_DIR/heartland-table.pdf"

echo "🍽️  Building The Heartland Table Cookbook..."
echo "================================================"

# Clean and create temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
mkdir -p "$OUTPUT_DIR"

# ========================================
# 1. Create Cover Page
# ========================================
echo "📸 Creating cover page..."
cat > "$TEMP_DIR/00-cover.md" << 'EOF'
\thispagestyle{empty}

\vspace*{2in}

\begin{center}

\includegraphics[width=6in]{../../Cover/cover_photo.png}

\vspace{1in}

{\Huge \textbf{THE HEARTLAND TABLE}}

\vspace{0.25in}

{\Large \textit{A Midwest Cookbook}}

\vspace{0.5in}

{\large Prairie Modern Cooking}

\vspace{0.25in}

{\large 2026}

\end{center}

\clearpage

EOF

# ========================================
# 2. Create Introduction
# ========================================
echo "📝 Creating introduction..."
cat > "$TEMP_DIR/01-introduction.md" << 'EOF'
# Introduction

Welcome to **The Heartland Table**, a celebration of Midwest cuisine, culture, and the warm hospitality that defines America's heartland.

From hotdish to casseroles, from Saturday morning pancakes to Sunday pot roast, these recipes capture the essence of Midwest cooking: hearty, comforting, and made with love.

Each recipe in this book has been carefully selected to represent the rich culinary traditions of the Midwest states—from the Great Lakes to the Great Plains, from farm kitchens to urban supper clubs.

\clearpage

EOF

# ========================================
# 3. Gather Recipes by Category
# ========================================

# Define category order
CATEGORIES=(
  "Breakfast"
  "Breads"
  "Appetizers"
  "Soups"
  "Mains"
  "Sides"
  "Desserts"
  "Drinks"
  "Snacks"
  "Preserves"
)

chapter_num=2

for category in "${CATEGORIES[@]}"; do
  category_dir="$RECIPES_DIR/$category"
  
  if [ -d "$category_dir" ]; then
    echo "📚 Processing category: $category"
    
    # Create chapter heading
    chapter_file="$TEMP_DIR/$(printf '%02d' $chapter_num)-$category.md"
    echo "" > "$chapter_file"
    echo "# $category" >> "$chapter_file"
    echo "" >> "$chapter_file"
    echo "\\clearpage" >> "$chapter_file"
    echo "" >> "$chapter_file"
    
    # Find all markdown files in this category (not in subdirectories like Updates)
    find "$category_dir" -maxdepth 1 -name "*.md" -type f | sort | while read recipe_file; do
      echo "  ✓ Adding: $(basename "$recipe_file")"
      
      # Add the recipe content with fixed image paths
      # Replace ../../Images/ with absolute path
      sed "s|../../Images/|$IMAGES_DIR/|g" "$recipe_file" >> "$chapter_file"
      echo "" >> "$chapter_file"
      echo "\\clearpage" >> "$chapter_file"
      echo "" >> "$chapter_file"
    done
    
    ((chapter_num++))
  fi
done

# ========================================
# 4. Add Special Sections
# ========================================
echo "🎯 Adding special sections..."

if [ -d "$SPECIAL_DIR" ]; then
  chapter_file="$TEMP_DIR/$(printf '%02d' $chapter_num)-special-sections.md"
  echo "" > "$chapter_file"
  echo "# Special Features" >> "$chapter_file"
  echo "" >> "$chapter_file"
  echo "\\clearpage" >> "$chapter_file"
  echo "" >> "$chapter_file"
  
  find "$SPECIAL_DIR" -name "*.md" -type f | sort | while read special_file; do
    echo "  ✓ Adding: $(basename "$special_file")"
    # Fix image paths in special sections too
    sed "s|../Images/|$IMAGES_DIR/|g" "$special_file" >> "$chapter_file"
    echo "" >> "$chapter_file"
    echo "\\clearpage" >> "$chapter_file"
    echo "" >> "$chapter_file"
  done
fi

# ========================================
# 5. Build PDF with Pandoc
# ========================================
echo ""
echo "🔨 Building PDF with Pandoc..."
echo "================================================"

# Combine all markdown files in order
MARKDOWN_FILES=$(find "$TEMP_DIR" -name "*.md" | sort)

# Run Pandoc
pandoc \
  "$SCRIPT_DIR/metadata.yaml" \
  $MARKDOWN_FILES \
  -o "$OUTPUT_PDF" \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=2 \
  --highlight-style=tango \
  --resource-path="$REPO_ROOT" \
  -V colorlinks=true \
  -V linkcolor=Maroon \
  -V urlcolor=Maroon \
  -V geometry:margin=0.75in \
  -V geometry:paperwidth=8in \
  -V geometry:paperheight=10in \
  2>&1 | grep -v "Missing character" || true

# ========================================
# 6. Cleanup and Report
# ========================================
echo ""
echo "================================================"

if [ -f "$OUTPUT_PDF" ]; then
  file_size=$(du -h "$OUTPUT_PDF" | cut -f1)
  page_count=$(pdfinfo "$OUTPUT_PDF" 2>/dev/null | grep "Pages:" | awk '{print $2}' || echo "unknown")
  
  echo "✅ SUCCESS! Cookbook built successfully!"
  echo ""
  echo "📖 Output: $OUTPUT_PDF"
  echo "📏 Size: $file_size"
  echo "📄 Pages: $page_count"
  echo ""
  echo "🎉 Your cookbook is ready!"
else
  echo "❌ ERROR: PDF was not created"
  exit 1
fi

# Optional: Keep or remove temp files
# Uncomment to keep temp files for debugging:
echo "🗂️  Temp files kept in: $TEMP_DIR"

# Uncomment to remove temp files:
# rm -rf "$TEMP_DIR"
# echo "🧹 Cleaned up temporary files"

echo "================================================"
