#!/bin/bash
# Generate PDF from the investor deck HTML using headless Chromium
# Usage: ./generate-pdf.sh [output-filename]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT="$SCRIPT_DIR/investor-deck.html"
OUTPUT="${1:-$SCRIPT_DIR/AdherePod-Investor-Deck.pdf}"

echo "Generating PDF from: $INPUT"
echo "Output: $OUTPUT"

chromium-browser \
    --headless \
    --disable-gpu \
    --no-sandbox \
    --print-to-pdf="$OUTPUT" \
    --print-to-pdf-no-header \
    --no-margins \
    "file://$INPUT" \
    2>/dev/null

if [ -f "$OUTPUT" ]; then
    echo "PDF generated successfully: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
else
    echo "Error: PDF generation failed"
    exit 1
fi
