# Farmhouse Modern - Design Specification

## Color Palette

```
Primary:    #2C5F4F  ████  Deep Forest Green
Secondary:  #E8E3D8  ████  Warm Linen  
Accent:     #C97D5D  ████  Terracotta
Text:       #1A1A1A  ████  Charcoal Black
Background: #FFFFFF  ████  Pure White
Highlight:  #F4EDE4  ████  Soft Beige
```

## Typography

### Display (Titles)
- **Font:** Playfair Display or Cormorant Garamond
- **Weight:** 700 (Bold)
- **Style:** Elegant serif with high contrast strokes
- **Usage:** Book title, recipe titles

### Headings
- **Font:** Montserrat
- **Weight:** 600 (Semi-Bold)
- **Style:** Clean, geometric sans-serif
- **Letter-spacing:** +0.05em (generous spacing)
- **Text-transform:** Uppercase for section headers
- **Usage:** Chapter names, section headers

### Body Text
- **Font:** Source Serif Pro or Georgia
- **Weight:** 400 (Regular)
- **Line-height:** 1.7 (very readable)
- **Usage:** Instructions, descriptions, ingredients

## Cover Design

### Layout
```
┌─────────────────────────────┐
│                             │
│    THE HEARTLAND TABLE      │  ← Deep Forest Green bar (#2C5F4F)
│                             │     White text, Playfair Display
├─────────────────────────────┤
│                             │
│                             │
│    [LARGE FOOD PHOTO]       │  ← Bright, clean food photography
│     Centered, lots of       │     Natural lighting, white plates
│     white space around      │     Rustic wood or marble surface
│                             │
│                             │
├─────────────────────────────┤
│   A Midwest Cookbook        │  ← Montserrat, #1A1A1A
│                             │
│ ━━━ (Terracotta line)       │  ← #C97D5D accent
│                             │
│  Michael F. Schecht         │  ← Small, clean sans-serif
└─────────────────────────────┘
```

### Key Elements
- **Minimal:** 70% white space
- **Photo:** Single hero image, professionally lit
- **Colors:** Primarily white with forest green and terracotta accents
- **Borders:** None or very thin (1px) in soft beige
- **Texture:** Subtle linen/canvas overlay at 5% opacity

## Interior Pages

### Recipe Hero Page (Page 1)
```
┌─────────────────────────────┐
│                             │
│                             │
│    [LARGE RECIPE PHOTO]     │  ← Full-width, bright, airy
│         8in x 5in           │     White background or natural setting
│                             │
│                             │
│                             │
├─────────────────────────────┤
│                             │
│  CHICKEN & DUMPLINGS        │  ← Playfair Display, 32pt
│  ━━━━━━━━━━━━━━━━━          │  ← Terracotta underline
│                             │
│  📍 Minnesota               │  ← Montserrat, 11pt, #2C5F4F
│                             │
│  [Description in soft       │  ← Source Serif, 12pt
│   beige box with minimal    │     #F4EDE4 background
│   left border]              │     #C97D5D border-left 3px
│                             │
└─────────────────────────────┘
```

### Recipe Detail Page (Page 2)
```
┌──────────┬──────────────────┐
│          │                  │
│ INGRED.  │  INSTRUCTIONS    │
│          │                  │
│ • Flour  │  1. [Step text]  │  ← Clean numbered steps
│ • Sugar  │                  │     Bold first sentence
│ • Eggs   │  2. [Step text]  │     Generous line spacing
│          │                  │
│ [Minimal │  3. [Step text]  │
│  sidebar │                  │
│  1.5in   │                  │
│  wide]   │                  │
│          │                  │
│          │  ────────────    │  ← Soft dividers
│          │                  │
│          │  DID YOU KNOW?   │  ← Montserrat uppercase
│          │  [Fun fact box]  │     #F4EDE4 background
│          │                  │
└──────────┴──────────────────┘
```

### Chapter Openers
- **Full page:** Deep forest green background (#2C5F4F)
- **Title:** White text, 48pt Playfair Display, centered
- **Icon:** Simple line-art icon in terracotta
- **Minimal decoration:** Single line element or geometric shape

## Visual Style Guidelines

### Photography
- **Lighting:** Bright, natural, soft shadows
- **Background:** White or light neutral surfaces
- **Props:** Minimal - white plates, natural wood, linen napkins
- **Focus:** Clean, uncluttered compositions
- **Processing:** Slightly desaturated, high brightness

### Spacing
- **Margins:** 0.5in minimum on all sides
- **Between elements:** 2-3em for major sections
- **Line spacing:** 1.7 for body text
- **Letter spacing:** +0.05em for headings

### Decorative Elements
- **Lines:** Thin (1-2px), terracotta or soft beige
- **Boxes:** Minimal, soft beige background with subtle border
- **Icons:** Simple, line-art style, forest green or terracotta
- **Texture:** Very subtle linen/canvas at 3-5% opacity

### Mood & Feel
- Clean, uncluttered, breathable
- Modern but warm
- Professional food magazine quality
- Instagram-worthy, shareable
- Approachable elegance

## CSS Implementation Notes

- Use CSS Grid for clean, aligned layouts
- Generous padding everywhere (1.5-2em)
- Border-radius: 2-4px maximum (very subtle)
- Box shadows: None or very subtle (0 2px 8px rgba(0,0,0,0.05))
- Transitions: 0.2s ease for hover states
- Focus on typography hierarchy and white space
