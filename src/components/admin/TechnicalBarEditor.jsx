import { useRef, useState, useCallback } from 'react'

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

export default function TechnicalBarEditor({ title, labels = [], selectedValue, onChange }) {
  if (!labels.length) return null

  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const getIdx = () => labels.findIndex(
    l => l.toLowerCase() === (selectedValue || '').toLowerCase()
  )
  const idx = getIdx()
  const selectedIndex = idx < 0 ? 0 : idx
  const pct = labels.length === 1
    ? 50
    : (selectedIndex / (labels.length - 1)) * 100

  // Get the color for the currently selected label (for thumb and badge)
  const selectedColor = getLabelColor(labels[selectedIndex] || labels[0])
  
  // Generate the blended gradient for the entire bar
  const blendedGradient = generateBlendedGradient(labels)

  // Convert pointer X → nearest label index
  const pctToLabelIdx = useCallback((clientX) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const raw = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    let best = 0, bestDist = Infinity
    labels.forEach((_, i) => {
      const slotPct = labels.length === 1 ? 0.5 : i / (labels.length - 1)
      const d = Math.abs(raw - slotPct)
      if (d < bestDist) { bestDist = d; best = i }
    })
    return best
  }, [labels])

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    onChange(labels[pctToLabelIdx(e.clientX)])
  }
  const handlePointerMove = (e) => {
    if (!dragging) return
    const newIdx = pctToLabelIdx(e.clientX)
    if (labels[newIdx] !== selectedValue) onChange(labels[newIdx])
  }
  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  // Handle label click
  const handleLabelClick = (label) => {
    onChange(label)
  }

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${dragging ? selectedColor : '#E8E8E8'}`,
      borderRadius: 10,
      padding: '14px 18px 10px',
      marginBottom: 8,
      transition: 'border-color 0.15s',
    }}>
      {/* Title + selected value badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#2A2A2A', fontFamily: "'Inter', sans-serif", margin: 0 }}>
          {title}
        </p>
        {selectedValue && (
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700,
            background: `${selectedColor}15`,
            color: selectedColor,
            padding: '2px 9px', borderRadius: 999,
            fontFamily: "'Inter', sans-serif",
            border: `1px solid ${selectedColor}40`,
            transition: 'all 0.2s',
          }}>
            {selectedValue}
          </span>
        )}
      </div>

      {/* Track + thumb + labels all in one positioned container */}
      <div
        ref={trackRef}
        style={{ position: 'relative', cursor: 'ew-resize', paddingBottom: 24, userSelect: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Blended gradient track - shows ALL colors mixed together */}
        <div style={{
          height: 4,
          borderRadius: 999,
          background: blendedGradient,
          position: 'relative',
        }} />

        {/* Thumb — positioned over track - uses white with selected color border */}
        <div style={{
          position: 'absolute',
          top: 2,
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: dragging ? 18 : 16,
          height: dragging ? 18 : 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          border: `${dragging ? 3 : 2}px solid ${selectedColor}`,
          boxShadow: dragging
            ? `0 3px 10px rgba(0,0,0,0.3), 0 0 0 3px ${selectedColor}30`
            : `0 2px 6px rgba(0,0,0,0.2), 0 0 0 2px ${selectedColor}20`,
          zIndex: 2,
          pointerEvents: 'none',
          transition: dragging ? 'width 0.1s, height 0.1s, border 0.1s' : 'left 0.2s ease, border 0.2s ease, width 0.1s, height 0.1s',
        }} />

        {/* Labels — each absolutely positioned at same % as its thumb slot */}
        {labels.map((label, i) => {
          const labelPct = labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100
          const active = i === selectedIndex
          // Align: first label left-align, last right-align, middle center
          const translateX = i === 0 ? '0%' : i === labels.length - 1 ? '-100%' : '-50%'
          const labelColor = getLabelColor(label)
          
          return (
            <span 
              key={i} 
              onClick={() => handleLabelClick(label)}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${labelPct}%`,
                transform: `translateX(${translateX})`,
                fontSize: '0.6875rem',
                fontFamily: "'Inter', sans-serif",
                color: active ? selectedColor : '#999999',
                fontWeight: active ? 700 : 400,
                lineHeight: 1,
                pointerEvents: 'auto',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s, font-weight 0.2s',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                background: active ? `${selectedColor}10` : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = labelColor
                  e.currentTarget.style.background = `${labelColor}10`
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#999999'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {label}
            </span>
          )
        })}
      </div>

      {/* Hint */}
      <p style={{ fontSize: '0.625rem', color: '#CCCCCC', fontFamily: "'Inter', sans-serif", margin: '4px 0 0' }}>
        ← drag slider or click labels to adjust →
      </p>
    </div>
  )
}
