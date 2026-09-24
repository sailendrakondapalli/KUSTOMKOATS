import { useRef, useState, useCallback } from 'react'

/**
 * TechnicalBarEditor — Draggable bar for admin product form.
 * Visually identical to TechnicalBar but the thumb is draggable.
 * Snaps to the nearest label position on release.
 *
 * Props:
 *   title         {string}
 *   labels        {string[]}
 *   selectedValue {string}
 *   onChange      (newSelectedValue: string) => void
 */
export default function TechnicalBarEditor({ title, labels = [], selectedValue, onChange }) {
  if (!labels.length) return null

  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const idx = labels.findIndex(
    l => l.toLowerCase() === (selectedValue || '').toLowerCase()
  )
  const pct = idx < 0
    ? 0
    : labels.length === 1
      ? 50
      : (idx / (labels.length - 1)) * 100

  // Convert pointer X position → nearest label index
  const pctToLabelIdx = useCallback((clientX) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const raw = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    // Find nearest label slot
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
    const newIdx = pctToLabelIdx(e.clientX)
    onChange(labels[newIdx])
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

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #EBEBEB',
      borderRadius: 12,
      padding: '16px 20px 12px',
      marginBottom: 12,
      userSelect: 'none',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{
          fontSize: '0.875rem', fontWeight: 600, color: '#1A1A1A',
          fontFamily: "'Inter', sans-serif", margin: 0,
        }}>
          {title}
        </p>
        {/* Selected value pill */}
        {selectedValue && (
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700,
            background: '#F0F9F0', color: '#16A34A',
            padding: '2px 10px', borderRadius: 999,
            fontFamily: "'Inter', sans-serif",
            border: '1px solid #BBF7D0',
          }}>
            {selectedValue}
          </span>
        )}
      </div>

      {/* Draggable track */}
      <div
        ref={trackRef}
        style={{ position: 'relative', height: 6, marginBottom: 10, marginLeft: 2, marginRight: 2, cursor: 'pointer' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Gradient track */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 999,
          background: 'linear-gradient(to right, #B8D8F0, #7EC8B8, #5DB88A)',
        }} />

        {/* Draggable thumb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: dragging
            ? '0 2px 12px rgba(0,0,0,0.30)'
            : '0 1px 6px rgba(0,0,0,0.20)',
          border: dragging ? '1.5px solid #16A34A' : '1.5px solid rgba(0,0,0,0.10)',
          zIndex: 2,
          transition: dragging ? 'none' : 'left 0.15s ease',
          cursor: 'grab',
        }} />

        {/* Snap point dots */}
        {labels.map((_, i) => {
          const dotPct = labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100
          const isActive = i === (idx < 0 ? 0 : idx)
          return (
            <div key={i} style={{
              position: 'absolute',
              top: '50%',
              left: `${dotPct}%`,
              transform: 'translate(-50%, -50%)',
              width: isActive ? 0 : 4,
              height: isActive ? 0 : 4,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
              zIndex: 1,
            }} />
          )
        })}
      </div>

      {/* Label hints */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {labels.map((label, i) => {
          const isActive = label.toLowerCase() === (selectedValue || '').toLowerCase()
          return (
            <span key={i} style={{
              fontSize: '0.75rem',
              fontFamily: "'Inter', sans-serif",
              color: isActive ? '#16A34A' : '#888888',
              fontWeight: isActive ? 700 : 400,
              textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center',
              flex: i === 0 || i === labels.length - 1 ? '0 0 auto' : 1,
              transition: 'color 0.15s',
            }}>
              {label}
            </span>
          )
        })}
      </div>

      <p style={{ fontSize: '0.6875rem', color: '#AAAAAA', fontFamily: "'Inter', sans-serif", marginTop: 8, margin: '8px 0 0' }}>
        Drag to adjust position
      </p>
    </div>
  )
}
