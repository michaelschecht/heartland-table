#!/bin/bash

# Preview the generated PDF
OUTPUT_PDF="output/heartland-table.pdf"

if [ ! -f "$OUTPUT_PDF" ]; then
  echo "❌ PDF not found. Run ./build-cookbook.sh first!"
  exit 1
fi

echo "📖 Opening $OUTPUT_PDF..."

# Try different PDF viewers
if command -v xdg-open &> /dev/null; then
  xdg-open "$OUTPUT_PDF"
elif command -v evince &> /dev/null; then
  evince "$OUTPUT_PDF" &
elif command -v okular &> /dev/null; then
  okular "$OUTPUT_PDF" &
elif command -v pdf-viewer &> /dev/null; then
  pdf-viewer "$OUTPUT_PDF" &
else
  echo "⚠️  No PDF viewer found. File is at: $(pwd)/$OUTPUT_PDF"
fi
