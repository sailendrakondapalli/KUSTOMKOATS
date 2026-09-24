/**
 * TechnicalBar — Read-only. Labels are absolutely positioned
 * to align exactly under their thumb slot on the track.
 */
export default function TechnicalBar({ title, labels = [], selectedValue }) {
  if (!labels.length) return null

  const idx = labels.findIndex(
    l => l.toLowerCase() === (selectedValue || '').toLowerCase()
  )
  const pct = idx < 0
    ? 0
    : labels.length === 1
      ? 50
      : (idx / (labels.length - 1)) * 100

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8E8',
      borderRadius: 10,
      padding: '14px 18px 10px',
      marginBottom: 10,
    }}>
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
        {/* Gradient track */}
        <div style={{
          height: 4,
          borderRadius: 999,
          background: 'linear-gradient(to right, #90CAE8, #6BBFB0, #4CAF85)',
        }} />

        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: 2,
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 5px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.07)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        {/* Labels — each at same % as thumb slot */}
        {labels.map((label, i) => {
          const labelPct = labels.length === 1 ? 50 : (i / (labels.length - 1)) * 100
          const translateX = i === 0 ? '0%' : i === labels.length - 1 ? '-100%' : '-50%'
          return (
            <span key={i} style={{
              position: 'absolute',
              bottom: 0,
              left: `${labelPct}%`,
              transform: `translateX(${translateX})`,
              fontSize: '0.6875rem',
              fontFamily: "'Inter', sans-serif",
              color: '#999999',
              fontWeight: 400,
              lineHeight: 1,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
