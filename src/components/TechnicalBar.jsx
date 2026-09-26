/**
 * TechnicalBar — Read-only. Labels are absolutely positioned
 * to align exactly under their thumb slot on the track.
 * The bar displays a smooth blended gradient of ALL configured colors.
 */

// Helper function to parse label color
const getLabelColor = (label) => {
  const lower = label.toLowerCase().trim()
  
  // Common color names
  const colorMap = {
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'purple': '#A855F7',
    'pink': '#EC4899',
    'orange': '#F97316',
    'cyan': '#06B6D4',
    'lime': '#84CC16',
    'indigo': '#6366F1',
    'teal': '#14B8A6',
    'amber': '#F59E0B',
    'emerald': '#10B981',
    'sky': '#0EA5E9',
    'violet': '#8B5CF6',
    'fuchsia': '#D946EF',
    'rose': '#F43F5E',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#6B7280',
    'grey': '#6B7280',
    'solid': '#6BBFB0',
    'matte': '#8B7355',
    'glossy': '#87CEEB',
    'metallic': '#B8B8B8',
  }
  
  // Check if it's a named color
  if (colorMap[lower]) return colorMap[lower]
  
  // Check if it's a hex color (#XXX or #XXXXXX)
  if (/^#([0-9A-F]{3}){1,2}$/i.test(label)) return label
  
  // Default color for unknown labels
  return '#6BBFB0'
}

// Generate smooth blended gradient from all label colors
const generateBlendedGradient = (labels) => {
  if (!labels.length) return '#E5E5E5'
  
  if (labels.length === 1) {
    const color = getLabelColor(labels[0])
    return color
  }
  
  // Create gradient stops for smooth blending
  const stops = labels.map((label, i) => {
    const color = getLabelColor(label)
    const position = (i / (labels.length - 1)) * 100
    return `${color} ${position}%`
  }).join(', ')
  
  return `linear-gradient(to right, ${stops})`
}

export default function TechnicalBar({ title, labels = [], selectedValue }) {
  if (!labels.length) return null

  const idx = labels.findIndex(
    l => l.toLowerCase() === (selectedValue || '').toLowerCase()
  )
  const selectedIndex = idx < 0 ? 0 : idx
  const pct = labels.length === 1
    ? 50
    : (selectedIndex / (labels.length - 1)) * 100

  // Get the color for the currently selected label (for thumb and badge)
  const selectedColor = getLabelColor(labels[selectedIndex] || labels[0])
  
  // Generate the blended gradient for the entire bar
  const blendedGradient = generateBlendedGradient(labels)

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: 10,
      padding: '14px 18px 10px',
      marginBottom: 10,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.02)'
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      {/* Title */}
      <p style={{
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#2A2A2A',
        fontFamily: "'Inter', sans-serif",
        margin: '0 0 14px 0',
      }}>
        {title}
      </p>

      {/* Track + thumb + labels in one positioned container */}
      <div style={{ position: 'relative', paddingBottom: 22 }}>
        {/* Blended gradient track - shows ALL colors mixed together */}
        <div style={{
          height: 4,
          borderRadius: 999,
          background: blendedGradient,
          position: 'relative',
        }} />

        {/* Thumb - uses selected color */}
        <div style={{
          position: 'absolute',
          top: 2,
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          border: `2px solid ${selectedColor}`,
          boxShadow: `0 2px 6px rgba(0,0,0,0.2), 0 0 0 2px ${selectedColor}20`,
          zIndex: 2,
          pointerEvents: 'none',
          transition: 'left 0.2s ease, border-color 0.2s ease',
        }} />

        {/* Labels — each at same % as thumb slot */}
        {labels.map((label, i) => {
          const labelPct = labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100
          const translateX = i === 0 ? '0%' : i === labels.length - 1 ? '-100%' : '-50%'
          const isSelected = i === selectedIndex
          const labelColor = getLabelColor(label)
          
          return (
            <span key={i} style={{
              position: 'absolute',
              bottom: 0,
              left: `${labelPct}%`,
              transform: `translateX(${translateX})`,
              fontSize: '0.6875rem',
              fontFamily: "'Inter', sans-serif",
              color: isSelected ? selectedColor : '#999999',
              fontWeight: isSelected ? 700 : 400,
              lineHeight: 1,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s, font-weight 0.2s',
            }}>
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
