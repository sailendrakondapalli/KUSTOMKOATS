import { useRef, useState, useCallback } from 'react'

export default function TechnicalBarEditor({ title, labels = [], selectedValue, onChange }) {
  if (!labels.length) return null

  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const getIdx = () => labels.findIndex(
    l => l.toLowerCase() === (selectedValue || '').toLowerCase()
  )
  const idx = getIdx()
  const pct = idx < 0
    ? 0
    : labels.length === 1
      ? 50
      : (idx / (labels.length - 1)) * 100

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

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${dragging ? '#6BBFB0' : '#E8E8E8'}`,
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
            background: '#ECFDF5', color: '#059669',
            padding: '2px 9px', borderRadius: 999,
            fontFamily: "'Inter', sans-serif",
            border: '1px solid #A7F3D0',
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
        {/* Gradient track */}
        <div style={{
          height: 4,
          borderRadius: 999,
          background: 'linear-gradient(to right, #90CAE8, #6BBFB0, #4CAF85)',
          position: 'relative',
        }} />

        {/* Thumb — positioned over track */}
        <div style={{
          position: 'absolute',
          top: 2,              /* half of track height = 4/2 = 2 */
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: dragging ? 18 : 16,
          height: dragging ? 18 : 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: dragging
            ? '0 2px 8px rgba(0,0,0,0.28), 0 0 0 2px #6BBFB0'
            : '0 1px 5px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.07)',
          zIndex: 2,
          pointerEvents: 'none',
          transition: dragging ? 'none' : 'left 0.1s ease',
        }} />

        {/* Labels — each absolutely positioned at same % as its thumb slot */}
        {labels.map((label, i) => {
          const labelPct = labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100
          const active = label.toLowerCase() === (selectedValue || '').toLowerCase()
          // Align: first label left-align, last right-align, middle center
          const textAlign = i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center'
          const translateX = i === 0 ? '0%' : i === labels.length - 1 ? '-100%' : '-50%'
          return (
            <span key={i} style={{
              position: 'absolute',
              bottom: 0,
              left: `${labelPct}%`,
              transform: `translateX(${translateX})`,
              fontSize: '0.6875rem',
              fontFamily: "'Inter', sans-serif",
              color: active ? '#059669' : '#999999',
              fontWeight: active ? 700 : 400,
              lineHeight: 1,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.1s',
            }}>
              {label}
            </span>
          )
        })}
      </div>

      {/* Hint */}
      <p style={{ fontSize: '0.625rem', color: '#CCCCCC', fontFamily: "'Inter', sans-serif", margin: '4px 0 0' }}>
        ← drag to adjust →
      </p>
    </div>
  )
}
