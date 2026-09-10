# Bulk Theme Fixes - Find and Replace Guide

Use your IDE's Find & Replace across all files to apply these changes:

## Color Replacements

### Brown/Gold → Red/Black/White Theme

**Search in**: `src/pages/**/*.jsx`, `src/components/**/*.jsx`

1. `#C8860A` → `#FF0000` (Primary accent - gold to red)
2. `#E5A020` → `#CC0000` (Hover state - lighter gold to darker red)
3. `#D97706` → `#FF0000` (Orange to red)
4. `#DDB87A` → `#333333` (Light brown text to dark gray)
5. `#2A1408` → `#FFFFFF` (Dark brown background to white)
6. `#5C3015` → `rgba(0, 0, 0, 0.1)` (Brown border to light gray)
7. `#1A0A02` → `#000000` (Very dark brown to black)
8. `#3D1F0A` → `#F8F8F8` (Medium brown to light gray)
9. `#8B6A4A` → `#666666` (Medium brown text to gray)

### Equestrian Theme → Automotive Theme

10. `#5B1E28` → `#FFFFFF` (Burgundy background to white)
11. `#762B35` → `#F8F8F8` (Dark burgundy to light gray)
12. `#9A7650` → `#FF0000` (Tan to red for buttons/accents)
13. `#B8955A` → `#666666` (Gold text to gray)
14. `#B6A58F` → `#333333` (Beige text to dark gray)
15. `#F3EBDD` → `#000000` (Cream text to black)
16. `#DDD4CF` → `#000000` (Light cream to black for headings)

## Tailwind Class Replacements

17. `bg-[#C8860A]` → `bg-[#FF0000]`
18. `text-[#C8860A]` → `text-[#FF0000]`
19. `border-[#C8860A]` → `border-[#FF0000]`
20. `hover:bg-[#E5A020]` → `hover:bg-[#CC0000]`
21. `hover:text-[#C8860A]` → `hover:text-[#FF0000]`
22. `bg-[#2A1408]` → `bg-white`
23. `text-[#DDB87A]` → `text-gray-700`
24. `border-[#5C3015]` → `border-gray-200`

## Font Replacements

25. `'Georgia, serif'` → `'Rajdhani', 'Inter', sans-serif` (for headings)
26. `'Cormorant Garamond', serif` → `'Rajdhani', 'Inter', sans-serif` (for headings)

## Text Content Replacements

27. `Horse Riding` → `Products` (or context-appropriate product name)
28. `Royal Hoof` → `Kustom Koats`
29. `Rudhraksha` → Remove or replace with appropriate automotive term
30. `rudraksha` → `automotive pearl` or `pearl`
31. `Horse Riding Academy` → `Automotive Pearls`
32. `Equestrian` → `Automotive`
33. `GIRI FARMS, Uniworld City, Aspen Greens, Nallambakkam, Tamil Nadu` → `India` (or appropriate address)
34. `www.royalhoof.com` → `www.kustomkoats.com`
35. `royalhoof.com` → `kustomkoats.com`
36. `Horse Riding-fallback.webp` → `product-fallback.webp`
37. `Certified sacred beads from Nepal` → `Premium automotive grade pearls`
38. `Authentic certified` → `Premium quality`

## Specific File Updates

### ProductDetailPage.jsx
- Line 99-107: Update tag colors from brown/gold to red/gray
- Line 151-159: Update breadcrumb colors and text
- Line 165: Update main image background from `#1A0A02` to `#F8F8F8`
- Line 195: Update thumbnail border from `#D97706` to `#FF0000`
- Line 210-217: Update category tag, title, and rating colors
- Line 222: Update price color from `#D97706` to `#FF0000`
- Line 243-252: Update variant/stock boxes backgrounds to white
- Line 277: Update button from brown to red
- Line 286: Update wishlist button border colors
- Line 298: Update share button colors
- Line 310-314: Update trust badges backgrounds to white
- Line 322-343: Update related products section colors

### EventsPage.jsx
- Complete redesign needed - currently using equestrian theme
- Background: Change from `#5B1E28` to `#FFFFFF`
- All text colors: Update to black/gray scale
- Buttons: Change from `#9A7650` to `#FF0000`
- Cards: Change from dark theme to white cards with red accents
- Remove all horse/equestrian imagery and text

### OrdersPage.jsx  
- Line 198: Update loading spinner from `#D97706` to `#FF0000`
- Check overall theme consistency

### ProtectedRoute.jsx
- Line 11: Update loading spinner from `#D97706` to `#FF0000`
- Background: Change from `#0A0A0A` to `#FFFFFF`

### ProductCard.jsx
- Verify white backgrounds
- Update hover states to use red
- Ensure consistent fonts

## Files Status

✅ Already Fixed:
- HomePage.jsx
- ColorsPage.jsx  
- ProductsPage.jsx
- ContactPage.jsx

⚠️ Needs Updates:
- ProductDetailPage.jsx (HIGH PRIORITY)
- EventsPage.jsx (HIGH PRIORITY)
- OrdersPage.jsx
- CartPage.jsx
- CheckoutPage.jsx
- WishlistPage.jsx
- ProfilePage.jsx
- LoginPage.jsx
- ProtectedRoute.jsx
- ProductCard.jsx (verify)
- Navbar.jsx (verify)
- Footer.jsx (verify)
- ReviewsSection.jsx (verify)

## Testing Checklist

After applying fixes:
- [ ] All pages use white (#FFFFFF) backgrounds
- [ ] All accent colors are red (#FF0000)
- [ ] All text is black/gray scale
- [ ] All headings use Rajdhani font
- [ ] All body text uses Inter font
- [ ] No brown, gold, burgundy, or tan colors remain
- [ ] No horse/riding/rudhraksha references
- [ ] Company name is Kustom Koats everywhere
- [ ] All loading spinners are red
- [ ] All buttons use red for primary actions
- [ ] All hover states are appropriate
- [ ] All borders are subtle gray

## Priority Order

1. **CRITICAL** (Customer-facing):
   - ProductDetailPage.jsx
   - EventsPage.jsx
   
2. **HIGH** (Shopping flow):
   - CartPage.jsx
   - CheckoutPage.jsx
   - OrdersPage.jsx

3. **MEDIUM** (User features):
   - WishlistPage.jsx
   - ProfilePage.jsx
   - ProductCard.jsx

4. **LOW** (Auth/Admin):
   - LoginPage.jsx
   - ProtectedRoute.jsx
   - Admin pages
