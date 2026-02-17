# Heartland Table Build Script

This script generates a themed PDF from `heartland-table.html` in the same folder as the script by default:

`artifacts/Heartland_Table/Build-Script/heartland-table.html`

## Setup

```bash
cd artifacts/Heartland_Table/Build-Script
npm install
```

## List available themes

```bash
node build-heartland-pdf.js --list-themes
```

## Build with a theme

```bash
node build-heartland-pdf.js --theme=heritage-ledger
```

If `--input` is not provided, the script uses:

`./heartland-table.html` (relative to `Build-Script`)

## Build from explicit file URL

```bash
node build-heartland-pdf.js --theme=heritage-ledger --input="file:///D:/AI_Agents/Specialized_Agents/mike_codex/artifacts/Heartland_Table/heartland-table.html"
```

## Custom output location/name

```bash
node build-heartland-pdf.js --theme=prairie-modern --out-dir="D:/AI_Agents/Specialized_Agents/mike_codex/artifacts/Heartland_Table" --output="heartland-table-prairie-modern.pdf"
```
