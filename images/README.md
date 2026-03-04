# Icon Instructions

## Current Icon

The [`icon.svg`](icon.svg) file is an SVG version of the plugin icon. It shows:
- Blue document background
- White document with frontmatter lines at top
- Three variables with curly braces in different colors:
  - Green (exists in frontmatter)
  - Orange (has default value)
  - Red (missing value)
- Arrow suggesting transformation/replacement

## Convert SVG to PNG

If needed for distribution or documentation:

### Option 1: Using Online Tool

1. Go to: https://cloudconvert.com/svg-to-png
2. Upload [`icon.svg`](icon.svg)
3. Set dimensions to **128x128**
4. Download as `icon.png`
5. Save in this folder

### Option 2: Using Inkscape (Free Software)

1. Download Inkscape: https://inkscape.org/
2. Open `icon.svg` in Inkscape
3. File > Export PNG Image
4. Set width and height to 128 pixels
5. Export as `icon.png`

### Option 3: Using ImageMagick (Command Line)

```bash
convert -background none -resize 128x128 icon.svg icon.png
```

## Design Notes

The current icon design:
- **Professional**: Clean, simple design
- **Recognizable**: Document with variables concept is clear
- **Theme Compatible**: Works in both light and dark themes
- **Meaningful Colors**: Uses the same green/orange/red as syntax highlighting
