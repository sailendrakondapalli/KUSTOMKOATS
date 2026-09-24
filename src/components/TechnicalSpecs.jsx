/**
 * TechnicalSpecs — Right-column specification list.
 *
 * Props:
 *   specs  {Array<{ spec_name: string, spec_value: string }>}
 */
export default function TechnicalSpecs({ specs = [] }) {
  if (!specs.length) return null

  return (
    <div style={{ border: '1px solid #E5E5E5', borderRadius: '10px', overflow: 'hidden' }}>
      {specs.map((spec, i) => (
        <div
          key={spec.id || i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '12px 16px',
            borderBottom: i < specs.length - 1 ? '1px solid #F0F0F0' : 'none',
            background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
          }}
        >
          {/* Spec name */}
          <span style={{
            flex: '0 0 140px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#333333',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.5',
            paddingTop: '1px',
          }}>
            {spec.spec_name}
          </span>

          {/* Divider */}
          <span style={{ color: '#DDDDDD', flexShrink: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>|</span>

          {/* Spec value */}
          <span style={{
            flex: 1,
            fontSize: '0.8125rem',
            color: '#555555',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.6',
            wordBreak: 'break-word',
          }}>
            {spec.spec_value}
          </span>
        </div>
      ))}
    </div>
  )
}
