// Burgundy & Beige Color Theme WITH VISUAL HIERARCHY
// Primary: #5B1E28 (Burgundy) with variations for depth

export const colors = {
  // Primary Burgundy (MAIN THEME with hierarchy)
  primary: '#5B1E28',           // Deep Burgundy - main background, primary sections
  primaryDark: '#25211C',       // Darker Burgundy - footer, alternate sections
  primaryLight: '#762B35',      // Lighter Burgundy - cards, elevated surfaces (CONTRAST)
  primaryHover: '#762B35',      // Even lighter - hover states
  
  // Beige/Cream (Text & Contrast)
  beige: '#F4EBDD',             // Light Beige - primary text
  beigeLight: '#FAF5E8',        // Very Light Beige - highlights
  beigeDark: '#C9B79C',         // Darker Beige - muted text, borders
  
  // Gold/Tan (Accent & CTAs) - STANDS OUT
  accent: '#B8955A',            // Gold/Tan - buttons, CTAs, highlights
  accentDark: '#8F7345',        // Darker Gold - button hover
  accentLight: '#D4B87A',       // Lighter Gold - subtle accents
  
  // Mauve/Rose Brown (Secondary)
  secondary: '#7E5A5F',         // Mauve/Rose Brown - secondary text
  secondaryDark: '#6B4D51',     // Darker Mauve
  secondaryLight: '#9A7479',    // Lighter Mauve
  
  // Dark Brown (Deep Contrast)
  dark: '#2E1E1E',              // Dark Brown - deep contrast, button text
  darkLight: '#3D2A2A',         // Lighter Dark Brown
  darkDark: '#1F1414',          // Very Dark Brown - shadows
  
  // Functional colors WITH HIERARCHY
  background: '#5B1E28',        // Main background (Burgundy)
  surface: '#762B35',           // Cards/surfaces (Lighter Burgundy - VISIBLE CONTRAST)
  surfaceAlt: '#25211C',        // Alternate sections (Darker Burgundy)
  surfaceHover: '#762B35',      // Hover state (Even lighter)
  
  textPrimary: '#F4EBDD',       // Primary text (Beige)
  textSecondary: '#B8955A',     // Secondary text/accents (Gold)
  textMuted: '#C9B79C',         // Muted text (Darker Beige)
  textDisabled: 'rgba(243,233,210,0.4)', // Disabled text
  
  border: 'rgba(243,233,210,0.15)',  // Border (beige with opacity)
  borderLight: 'rgba(243,233,210,0.1)', // Light border
  
  divider: 'rgba(243,233,210,0.2)', // Divider lines
  
  // States
  hover: 'rgba(243,233,210,0.1)',   // Hover overlay
  active: 'rgba(200,161,101,0.2)',  // Active state
  focus: '#B8955A',                 // Focus ring
  
  // Semantic colors
  success: '#6B8E6B',           // Success green
  warning: '#B8955A',           // Warning (gold)
  error: '#B5454D',             // Error red (burgundy-ish)
  info: '#7E5A5F',              // Info (mauve)
}

// Gradient combinations
export const gradients = {
  primary: 'linear-gradient(135deg, #5B1E28 0%, #762B35 100%)',
  accent: 'linear-gradient(135deg, #B8955A 0%, #D4B87A 100%)',
  dark: 'linear-gradient(180deg, #2E1E1E 0%, #1F1414 100%)',
  hero: 'linear-gradient(135deg, rgba(92,29,36,0.95) 0%, rgba(74,23,32,0.98) 100%)',
  overlay: 'linear-gradient(to bottom, rgba(92,29,36,0) 0%, rgba(92,29,36,0.9) 100%)',
}

// Opacity helpers
export const alpha = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export default colors
