import { useRef, useState, useCallback } from 'react'

/**
 * TechnicalBarEditor — Draggable version of TechnicalBar for admin.
 * Visually matches TechnicalBar but thumb is draggable.
 * Snaps to nearest label on release.
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
      border: `1px solid ${dragging ? '#6BBFB0' : '#E8E8E8'}`,
      borderRadius: 10,
      padding: '14px 18px 12px',
      marginBottom: 8,
      transition: 'border-color 0.15s',
    }}>
      {/* Title + current value */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{
          fontSize: '0.8125rem', fontWeight: 500, color: '#2A2A2A',
          fontFamily: "'Inter', sans-serif", margin: 0,
        }}>
          {title}
        </p>
        {selectedValue && (
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700,
            background: '#ECFDF5', color: '#059669',
            padding: '2px 9px', borderRadius: 999,
            fontFamily: "'Inter', sans-serif",
            border: '1px solid #A7F3D0',
          }}>
            {selectedValue}
          </span>
        )}
      </div>

      {/* Draggable track */}
      <div
        ref={trackRef}
        style={{ position: 'relative', height: 20, marginBottom: 6, cursor: 'ew-resize' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Gradient track */}
        <div style={{
          position: 'absolute',
          top: '50%', left: 0, right: 0,
          height: 4,
          transform: 'translateY(-50%)',
          borderRadius: 999,
          background: 'linear-gradient(to right, #90CAE8, #6BBFB0, #4CAF85)',
        }} />

        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: dragging ? 18 : 16,
          height: dragging ? 18 : 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: dragging
            ? '0 2px 8px rgba(0,0,0,0.25), 0 0 0 2px #6BBFB0'
            : '0 1px 4px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 2,
          transition: dragging ? 'none' : 'left 0.12s ease, width 0.1s, height 0.1s',
        }} />
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        {labels.map((label, i) => {
          const active = label.toLowerCase() === (selectedValue || '').toLowerCase()
          return (
            <span key={i} style={{
              fontSize: '0.6875rem',
              fontFamily: "'Inter', sans-serif",
              color: active ? '#059669' : '#999999',
              fontWeight: active ? 600 : 400,
              transition: 'color 0.12s',
            }}>
              {label}
            </span>
          )
        })}
      </div>

      {/* Hint */}
      <p style={{ fontSize: '0.625rem', color: '#BBBBBB', fontFamily: "'Inter', sans-serif", marginTop: 6, marginBottom: 0 }}>
        ← drag to set position →
      </p>
    </div>
  )
}
