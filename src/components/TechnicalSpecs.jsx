/**
 * TechnicalSpecs — Right-column specification list matching the reference image.
 * Left: spec name (grey, light)  |  Right: value (bold, dark, right-aligned)
 */
export default function TechnicalSpecs({ specs = [] }) {
  if (!specs.length) return null

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #EBEBEB',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {specs.map((spec, i) => (
        <div
          key={spec.id || i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: '13px 20px',
            borderBottom: i < specs.length - 1 ? '1px solid #F3F3F3' : 'none',
          }}
        >
          {/* Spec name — left, grey */}
          <span style={{
            fontSize: '0.875rem',
            color: '#777777',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            flexShrink: 0,
            maxWidth: '45%',
            lineHeight: 1.5,
          }}>
            {spec.spec_name}
          </span>

          {/* Spec value — right, bold dark */}
          <span style={{
            fontSize: '0.875rem',
            color: '#1A1A1A',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            textAlign: 'right',
            lineHeight: 1.5,
            flex: 1,
          }}>
            {spec.spec_value}
          </span>
        </div>
      ))}
    </div>
  )
}
