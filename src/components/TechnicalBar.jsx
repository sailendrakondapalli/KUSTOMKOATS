/**
 * TechnicalBar — Read-only display matching the reference image.
 * Compact white card, gradient track, white thumb, labels below.
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
      padding: '16px 18px 12px',
      marginBottom: 10,
    }}>
      {/* Title */}
      <p style={{
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: '#2A2A2A',
        fontFamily: "'Inter', sans-serif",
        marginBottom: 12,
        margin: '0 0 12px 0',
      }}>
        {title}
      </p>

      {/* Track container */}
      <div style={{ position: 'relative', height: 20, marginBottom: 6 }}>
        {/* Gradient track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
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
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 4px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 2,
          flexShrink: 0,
        }} />
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex',
        justifyContent: labels.length === 1 ? 'center' : 'space-between',
        marginTop: 2,
      }}>
        {labels.map((label, i) => (
          <span key={i} style={{
            fontSize: '0.6875rem',
            fontFamily: "'Inter', sans-serif",
            color: '#999999',
            fontWeight: 400,
            lineHeight: 1,
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
