/**
 * TechnicalBar — Interactive horizontal gradient bar with a circular indicator.
 *
 * Props:
 *   title         {string}   — e.g. "Color Vibe"
 *   labels        {string[]} — e.g. ["Stealthy", "Bold", "Extreme"]
 *   selectedValue {string}   — one of the labels, e.g. "Bold"
 */
export default function TechnicalBar({ title, labels = [], selectedValue }) {
  if (!labels.length) return null

  // Calculate indicator position as a percentage (0-100)
  const idx = labels.findIndex(l => l.toLowerCase() === (selectedValue || '').toLowerCase())
  const position = idx < 0 ? 0 : labels.length === 1 ? 50 : (idx / (labels.length - 1)) * 100

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#000000',
          fontFamily: "'Inter', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {title}
        </span>
        {idx >= 0 && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#FF0000',
            fontFamily: "'Inter', sans-serif",
            background: 'rgba(255,0,0,0.06)',
            padding: '2px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(255,0,0,0.15)',
          }}>
            {selectedValue}
          </span>
        )}
      </div>

      {/* Bar + indicator */}
      <div style={{ position: 'relative', height: '8px', marginBottom: '8px' }}>
        {/* Background gradient track */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '999px',
          background: 'linear-gradient(to right, #E8E8E8 0%, #CCCCCC 40%, #888888 70%, #444444 100%)',
        }} />
        {/* Red filled track up to indicator */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${position}%`,
          borderRadius: '999px 0 0 999px',
          background: 'linear-gradient(to right, #FF6666, #FF0000)',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
        {/* Circular indicator */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${position}%`,
          transform: 'translate(-50%, -50%)',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '3px solid #FF0000',
          boxShadow: '0 2px 8px rgba(255,0,0,0.35)',
          transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 2,
        }} />
      </div>

      {/* Labels row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {labels.map((label, i) => (
          <span key={i} style={{
            fontSize: '0.6875rem',
            fontFamily: "'Inter', sans-serif",
            color: label.toLowerCase() === (selectedValue || '').toLowerCase() ? '#FF0000' : '#999999',
            fontWeight: label.toLowerCase() === (selectedValue || '').toLowerCase() ? 700 : 400,
            transition: 'color 0.3s',
            textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center',
            flex: i === 0 || i === labels.length - 1 ? '0 0 auto' : '1',
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
