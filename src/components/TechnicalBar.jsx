/**
 * TechnicalBar — Read-only display matching the reference image.
 *
 * Props:
 *   title         {string}   — e.g. "Color Vibe"
 *   labels        {string[]} — e.g. ["Stealthy", "Bold", "Extreme"]
 *   selectedValue {string}   — one of the labels, e.g. "Bold"
 */
export default function TechnicalBar({ title, labels = [], selectedValue }) {
  if (!labels.length) return null

  const idx = labels.findIndex(
    l => l.toLowerCase() === (selectedValue || '').toLowerCase()
  )
  // Position 0–100 based on label index
  const pct = idx < 0
    ? 0
    : labels.length === 1
      ? 50
      : (idx / (labels.length - 1)) * 100

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #EBEBEB',
      borderRadius: 12,
      padding: '18px 20px 14px',
      marginBottom: 12,
    }}>
      {/* Title */}
      <p style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#1A1A1A',
        fontFamily: "'Inter', sans-serif",
        marginBottom: 14,
      }}>
        {title}
      </p>

      {/* Track + Thumb */}
      <div style={{ position: 'relative', height: 6, marginBottom: 10, marginLeft: 2, marginRight: 2 }}>
        {/* Full gradient track */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          background: 'linear-gradient(to right, #B8D8F0, #7EC8B8, #5DB88A)',
        }} />

        {/* Thumb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 6px rgba(0,0,0,0.20)',
          border: '1.5px solid rgba(0,0,0,0.08)',
          zIndex: 2,
        }} />
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {labels.map((label, i) => (
          <span key={i} style={{
            fontSize: '0.75rem',
            fontFamily: "'Inter', sans-serif",
            color: '#888888',
            fontWeight: 400,
            textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center',
            flex: i === 0 || i === labels.length - 1 ? '0 0 auto' : 1,
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
