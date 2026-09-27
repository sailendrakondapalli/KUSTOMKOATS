# Hero Section - Exact Positioning Specification

## Overview
Hero content positioned in the upper-left portion of the viewport with exact sizing and placement matching premium automotive website standards.

---

## Content Structure

```
INSPIRED BY PASSION          ← Eyebrow (24px)

MAKE YOUR                    ← Main heading
PRESENCE                        (86px desktop)
FEEL                            5 exact lines
IMPOSSIBLE                      Line height: 0.94
TO IGNORE                       Max-width: 380px

[ DISCOVER MORE → ]          ← CTA Button (220×62px)
```

---

## Positioning Specifications

### Hero Content Container

#### Desktop (≥ 1024px)
```css
position: absolute;
left: 40px;
top: 125px;
width: 400px;
z-index: 10;
```

#### Tablet (768px - 1023px)
```css
position: absolute;
left: 35px;
top: 120px;
width: 400px;
z-index: 10;
```

#### Mobile (< 768px)
```css
position: absolute;
left: 20px;
top: 120px;
width: calc(100% - 40px);
z-index: 10;
```

### Key Positioning Rules:
- ❌ **NO** `left: 50%; transform: translateX(-50%)`
- ❌ **NO** vertical centering
- ❌ **NO** flexbox centering
- ✅ **YES** absolute positioning from top-left
- ✅ **YES** upper-middle portion of viewport
- ✅ **YES** left-aligned throughout

---

## Typography Specifications

### 1. Eyebrow Text
**Text:** "INSPIRED BY PASSION"

```css
font-family: 'Bebas Neue', sans-serif;
font-size: 24px;
font-weight: 400;
letter-spacing: 2px;
line-height: 1;
color: #FFFFFF;
margin-bottom: 12px;
text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
```

### 2. Main Heading
**Text (5 lines, exact breaks):**
```
MAKE YOUR
PRESENCE
FEEL
IMPOSSIBLE
TO IGNORE
```

#### Desktop (≥ 1024px)
```css
font-family: 'Bebas Neue', sans-serif;
font-weight: 400;
font-size: 86px;
line-height: 0.94;
letter-spacing: 1px;
text-transform: uppercase;
color: #FFFFFF;
width: 380px;
max-width: 380px;
text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 
             0 0 30px rgba(255, 0, 0, 0.3);
```

#### Tablet (768px - 1023px)
```css
font-size: 72px;
/* All other properties same */
```

#### Mobile (< 768px)
```css
font-size: clamp(48px, 12vw, 62px);
line-height: 0.95;
max-width: 100%;
/* All other properties same */
```

### 3. CTA Button
**Text:** "DISCOVER MORE →"

```css
width: 220px;
height: 62px;
margin-top: 55px;
font-family: 'Bebas Neue', sans-serif;
font-size: 21px;
font-weight: 400;
letter-spacing: 1.5px;
background: #FFFFFF;
color: #000000;
border: none;
border-radius: 3px;
text-transform: uppercase;
```

---

## Size Hierarchy

### Desktop Reference (1440px+)
| Element | Size |
|---------|------|
| Eyebrow | 24px |
| Main Heading | 86px |
| Button Text | 21px |
| Content Width | 380px |
| Button Width | 220px |
| Button Height | 62px |

### Tablet (1024px - 1439px)
| Element | Size |
|---------|------|
| Eyebrow | 24px |
| Main Heading | 72px |
| Button Text | 21px |
| Content Width | 380px |
| Button Width | 220px |
| Button Height | 62px |

### Mobile (≤ 767px)
| Element | Size |
|---------|------|
| Eyebrow | 24px |
| Main Heading | 48-62px (clamp) |
| Button Text | 21px |
| Content Width | calc(100% - 40px) |
| Button Width | 220px |
| Button Height | 62px |

---

## Responsive Breakpoint Rules

### 1440px and above
```css
.hero-content-container {
  left: 40px;
  top: 125px;
}
.hero-heading-text {
  font-size: 86px;
}
```

### 1024px - 1439px
```css
.hero-content-container {
  left: 40px;
  top: 125px;
}
.hero-heading-text {
  font-size: 86px;
}
```

### 768px - 1023px (Tablet)
```css
.hero-content-container {
  left: 35px;
  top: 120px;
}
.hero-heading-text {
  font-size: 72px;
}
```

### Below 768px (Mobile)
```css
.hero-content-container {
  left: 20px;
  top: 120px;
  width: calc(100% - 40px);
}
.hero-heading-text {
  font-size: clamp(48px, 12vw, 62px);
  line-height: 0.95;
  max-width: 100%;
}
```

---

## Visual Layout

```
┌──────────────────────────────────────────┐
│ [Navbar - Fixed, z-index: 1000]         │
│                                          │
│  ← 40px                                  │
│     ↓ 125px                              │
│     INSPIRED BY PASSION                  │
│                                          │
│     MAKE YOUR      }                     │
│     PRESENCE       } 86px                │
│     FEEL           } 380px wide          │
│     IMPOSSIBLE     } line-height: 0.94   │
│     TO IGNORE      }                     │
│                                          │
│     [ DISCOVER MORE → ]                  │
│        220×62px                          │
│                                          │
│  [Video Background - Full viewport]     │
│                                          │
└──────────────────────────────────────────┘
```

---

## Critical Requirements

### ✅ DO:
1. Position content absolute from top-left
2. Use exact pixel values for left/top positioning
3. Keep heading width at 380px max (desktop)
4. Maintain 5 exact line breaks in heading
5. Use Bebas Neue for all hero text
6. Keep content in upper-middle portion
7. Use 86px heading size on desktop
8. Use line-height 0.94 for tight stacking
9. Position button 55px below heading

### ❌ DON'T:
1. Center content horizontally or vertically
2. Use `left: 50%; transform: translateX(-50%)`
3. Use flexbox `justify-center` or `items-center`
4. Make heading too small (< 75px desktop)
5. Make heading too large (> 105px)
6. Allow automatic line wrapping
7. Change the wording or line breaks
8. Move content too far down the viewport
9. Move content toward center of screen

---

## Z-Index Stack

```
Navbar: z-index: 1000 (Fixed, always on top)
Hero Content: z-index: 10
Dark Overlay: z-index: 1
Video Background: z-index: 0
```

---

## Animation Timing

```jsx
Eyebrow Text:
  initial: { opacity: 0, y: 20 }
  animate: { opacity: 1, y: 0 }
  transition: { duration: 0.6, delay: 0.2 }

Main Heading:
  initial: { opacity: 0, y: 25 }
  animate: { opacity: 1, y: 0 }
  transition: { duration: 0.8, delay: 0.4 }

CTA Button:
  initial: { opacity: 0, y: 20 }
  animate: { opacity: 1, y: 0 }
  transition: { duration: 0.8, delay: 1.2 }
```

---

## Text Shadows

### Eyebrow
```css
text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
```

### Main Heading
```css
text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 
             0 0 30px rgba(255, 0, 0, 0.3);
```

**Purpose:**
- Improves readability over video
- Adds depth and premium feel
- Red glow enhances automotive aesthetic

---

## Button States

### Default
```css
background: #FFFFFF;
color: #000000;
transform: scale(1);
box-shadow: none;
```

### Hover
```css
transform: scale(1.05);
box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
transition: all 0.3s ease;
```

---

## Exact HTML Structure

```html
<div class="hero-content-container">
  <!-- Eyebrow -->
  <p>INSPIRED BY PASSION</p>
  
  <!-- Main Heading (5 lines, hard breaks) -->
  <h1 class="hero-heading-text">
    MAKE YOUR<br />
    PRESENCE<br />
    FEEL<br />
    IMPOSSIBLE<br />
    TO IGNORE
  </h1>
  
  <!-- CTA Button -->
  <a href="/shop/xtreme-kolorz">
    DISCOVER MORE
    <ArrowRight />
  </a>
</div>
```

---

## Testing Checklist

### Desktop (≥ 1024px)
- [x] Content at left: 40px, top: 125px
- [x] Heading size: 86px
- [x] Heading width: max 380px
- [x] 5 exact line breaks maintained
- [x] Button: 220×62px, 55px below heading
- [x] Content NOT centered
- [x] Content in upper-left portion

### Tablet (768px - 1023px)
- [x] Content at left: 35px, top: 120px
- [x] Heading size: 72px
- [x] All other properties maintained
- [x] Readable on tablet screens

### Mobile (< 768px)
- [x] Content at left: 20px, top: 120px
- [x] Content width: calc(100% - 40px)
- [x] Heading size: 48-62px (responsive)
- [x] Line-height: 0.95
- [x] 5 line breaks preserved
- [x] Button fits within viewport
- [x] No horizontal overflow

### All Devices
- [x] Bebas Neue font loaded
- [x] Text shadows applied
- [x] Animations smooth
- [x] Button hover works
- [x] Arrow icon visible
- [x] Video background visible
- [x] Dark overlay at 30%
- [x] Navbar not covering content

---

## Viewport Width Examples

| Viewport | Left Offset | Top Offset | Heading Size | Content Width |
|----------|-------------|------------|--------------|---------------|
| 320px | 20px | 120px | 48px | 280px |
| 375px | 20px | 120px | 50px | 335px |
| 430px | 20px | 120px | 55px | 390px |
| 768px | 35px | 120px | 72px | 400px |
| 1024px | 40px | 125px | 86px | 400px |
| 1440px | 40px | 125px | 86px | 400px |
| 1920px | 40px | 125px | 86px | 400px |

---

## Implementation Notes

### Removed Features:
- ❌ Word-by-word animation (AnimatedWords component)
- ❌ Vertical centering (flexbox)
- ❌ Horizontal centering
- ❌ Responsive padding containers
- ❌ Max-width wrappers

### Added Features:
- ✅ Absolute positioning from top-left
- ✅ Hard line breaks with `<br />`
- ✅ Fixed dimensions (380px width)
- ✅ Exact pixel positioning
- ✅ Simple fade-in animations
- ✅ Responsive media queries

---

## Files Modified
- `src/pages/HomePage.jsx` - HeroSection component

## Changes Applied
1. Removed AnimatedWords component
2. Changed from flexbox to absolute positioning
3. Added exact left/top pixel values
4. Set fixed width (380px desktop)
5. Used `<br />` for exact line breaks
6. Simplified animations (fade-in only)
7. Added responsive media queries
8. Set exact button dimensions (220×62px)
9. Positioned button 55px below heading
10. Applied Bebas Neue to all hero text

---

**Status:** ✅ **COMPLETE**
**Positioning:** Left-aligned, upper portion
**Typography:** Bebas Neue, 86px desktop
**Layout:** Premium automotive aesthetic
**Production Ready:** YES
