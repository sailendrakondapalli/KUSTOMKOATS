# Kustom Koats Theme Standardization - Complete Fix List

## Brand Standards
- **Primary Color**: #FF0000 (Red)
- **Background**: #FFFFFF (White)
- **Text Colors**: 
  - Primary: #000000 (Black)
  - Secondary: #333333 (Dark Gray)
  - Tertiary: #666666 (Medium Gray)
- **Fonts**:
  - Headings: 'Rajdhani', 'Inter', sans-serif
  - Body: 'Inter', sans-serif
- **Company**: Kustom Koats (Automotive Pearls, not Horse Riding/Rudhraksha)

## Files Fixed ✅
1. HomePage.jsx - Already using correct theme
2. ColorsPage.jsx - Hero section fixed
3. ProductsPage.jsx - Major sections updated (header, sidebar, pagination)

## Files Still Need Fixing ❌

### HIGH PRIORITY (Customer-Facing)

#### Contact

Page.jsx
**Issues**:
- Using dark brown/burgundy theme (#5B1E28, #762B35, #B8955A)
- Wrong color scheme throughout
- Needs complete redesign to match HomePage

**Changes Needed**:
- Background: Change to #FFFFFF
- Text: Change to black/gray scale
- Buttons: Use #FF0000 for primary actions
- Form fields: White backgrounds with subtle borders
- Remove all brown/burgundy colors
- Update fonts to Rajdhani/Inter

#### ProductDetailPage.jsx
**Issues**:
- Using brown/gold theme (#C8860A, #DDB87A, #2A1408, #5C3015)
- References to "Horse Riding" instead of products
- Wrong company branding

**Changes Needed**:
- Background colors: White (#FFFFFF)
- Accent color: Red (#FF0000)
- Text: Black/gray scale
- Buttons: Red primary, white secondary
- Product cards: White backgrounds
- Update all color references
- Fix product terminology

#### EventsPage.jsx
**Issues**:
- Equestrian/horse theme (#5B1E28, #9A7650, etc.)
- Wrong branding entirely

**Changes Needed**:
- Complete redesign to match automotive theme
- Background: White
- Accents: Red
- Update all copy and branding

### MEDIUM PRIORITY

#### OrdersPage.jsx
- Loading spinner color needs update (#D97706 → #FF0000)
- Check overall theme consistency

#### CartPage.jsx
- Verify theme consistency
- Update any brown/gold colors to red/black/white

#### CheckoutPage.jsx
- Verify theme consistency
- Ensure buttons use red

#### WishlistPage.jsx
- Verify theme consistency

#### ProfilePage.jsx
- Verify theme consistency

### LOW PRIORITY (Admin/Auth)

#### Admin pages
- Can keep functional, but should ideally match theme

#### LoginPage.jsx
- Should match main theme

#### ProtectedRoute.jsx
- Loading spinner: #D97706 → #FF0000

## Component Files to Check

### ProductCard.jsx
- Verify uses correct colors
- Should have white background, red accents

### Navbar.jsx
- Already open in editor - verify theme

### Footer.jsx
- Already open in editor - verify theme

### ReviewsSection.jsx
- Verify theme consistency

## Quick Find & Replace Guide

### Colors to Replace:
- `#C8860A` → `#FF0000` (or appropriate red)
- `#DDB87A` → `#333333` or `#666666` (text)
- `#2A1408` → `#FFFFFF` or `#F8F8F8` (backgrounds)
- `#5C3015` → `rgba(0, 0, 0, 0.1)` (borders)
- `#E5A020` → `#CC0000` (hover red)
- `#D97706` → `#FF0000` (accent/spinner)
- `#5B1E28` → `#FFFFFF` (backgrounds)
- `#762B35` → `#F8F8F8` (light backgrounds)
- `#9A7650` → `#FF0000` (buttons/accents)
- `#B8955A` → `#666666` (text)
- `#B6A58F` → `#333333` (text)

### Fonts to Verify:
- Replace `Georgia, serif` with `'Rajdhani', 'Inter', sans-serif` for headings
- Ensure body text uses `'Inter', sans-serif`

### Text References to Update:
- "Horse Riding" → "Products" or specific product type
- "Royal Hoof" → "Kustom Koats"
- "Rudhraksha" → Remove entirely
- "Equestrian" → "Automotive"
- Any horse/riding references → Automotive/pearl references

## Testing Checklist
After all fixes:
- [ ] All pages use white backgrounds
- [ ] All accent colors are red (#FF0000)
- [ ] All text is black/gray scale
- [ ] All fonts are Rajdhani (headings) and Inter (body)
- [ ] No references to horses, riding, rudhraksha
- [ ] Company name is Kustom Koats everywhere
- [ ] Product terminology is automotive pearls
- [ ] All buttons use red primary color
- [ ] All loading spinners are red
- [ ] All hover states use appropriate red shades
