#!/bin/bash
# Manual PDF generation using Google Chrome
# Use this if Puppeteer times out

HTML_FILE="$PWD/output/heartland-table.html"
PDF_FILE="$PWD/output/heartland-table.pdf"

echo "Opening HTML in Chrome for manual PDF generation..."
echo ""
echo "Steps:"
echo "1. Chrome will open with the cookbook HTML"
echo "2. Press Ctrl+P (or Cmd+P on Mac) to print"
echo "3. Choose 'Save as PDF' as destination"
echo "4. Save to: $PDF_FILE"
echo "5. Make sure 'Background graphics' is enabled"
echo ""
echo "Opening Chrome..."

# Try different Chrome/Chromium paths
if command -v google-chrome &> /dev/null; then
    google-chrome "$HTML_FILE"
elif command -v chromium &> /dev/null; then
    chromium "$HTML_FILE"
elif command -v chromium-browser &> /dev/null; then
    chromium-browser "$HTML_FILE"
else
    echo "Chrome/Chromium not found. Please open this file manually:"
    echo "$HTML_FILE"
fi
