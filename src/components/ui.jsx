import { SPICY_LEVELS } from '../utils/helpers.js'

const s = {
  btn: {
    base: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
      fontWeight: 500, border: '0.5px solid', transition: 'all .15s', cursor: 'pointer',
    },
    primary: { background: '#D85A30', borderColor: '#D85A30', color: '#fff' },
    outline: { background: 'transparent', borderColor: '#D85A30', color: '#712B13' },
    ghost: { background: 'transparent', borderColor: 'rgba(0,0,0,0.12)', color: '#5a5a56' },
  }
}

export function Btn({ variant = 'primary', onClick, children, style, type = 'button', disabled }) {
  const vs = s.btn[variant] || s.btn.primary
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{ ...s.btn.base, ...vs, opacity: disabled ? 0.5 : 1, ...style }}
    >
      {children}
    </button>
  )
}

export function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#5a5a56', marginBottom: 5 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#9a9a94', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
      borderRadius: 14, overflow: 'hidden', ...style
    }}>
      {children}
    </div>
  )
}

export function StarRating({ value = 0, onChange, size = 24 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onChange?.(n)}
          style={{
            fontSize: size, lineHeight: 1, cursor: onChange ? 'pointer' : 'default',
            color: n <= value ? '#EF9F27' : 'rgba(0,0,0,0.15)',
            transition: 'transform .1s, color .1s',
          }}
          onMouseEnter={e => { if (onChange) e.target.style.transform = 'scale(1.2)' }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)' }}
        >★</span>
      ))}
    </div>
  )
}

export function SpicyPicker({ value, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 5, padding: '8px 14px',
      background: '#FCEBEB', borderTop: '0.5px solid rgba(0,0,0,0.08)',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: 12, color: '#791F1F', flex: 1 }}>🌶 這次辣度</span>
      {SPICY_LEVELS.map(lv => (
        <button
          key={lv}
          onClick={() => onChange(lv === value ? null : lv)}
          style={{
            padding: '3px 10px', borderRadius: 12, fontSize: 12, border: '0.5px solid #F09595',
            cursor: 'pointer', transition: 'all .15s',
            background: value === lv ? '#E24B4A' : '#fff',
            color: value === lv ? '#fff' : '#A32D2D',
            fontWeight: value === lv ? 500 : 400,
          }}
        >{lv}</button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ fontSize: 14, flex: 1, color: '#1a1a18' }}>{label}</span>
      <span style={{
        position: 'relative', width: 40, height: 22, display: 'inline-block',
        background: checked ? '#D85A30' : 'rgba(0,0,0,0.15)',
        borderRadius: 11, transition: 'background .2s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 3, left: checked ? 19 : 3,
          width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s',
        }} />
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
      </span>
    </label>
  )
}

export function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9a9a94' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  )
}

export function PriceTag({ price }) {
  const map = { low: '$', mid: '$$', high: '$$$', vhigh: '$$$$' }
  const label = { low: '100以下', mid: '100–300', high: '300–600', vhigh: '600以上' }
  if (!price) return null
  return (
    <span style={{
      fontSize: 11, padding: '2px 7px', borderRadius: 8,
      background: '#FAEEDA', color: '#633806', fontWeight: 500,
    }}>
      {map[price]} {label[price]}
    </span>
  )
}

export function SpicyBadge() {
  return (
    <span style={{
      fontSize: 11, padding: '2px 7px', borderRadius: 8,
      background: '#FCEBEB', color: '#A32D2D',
    }}>🌶 可辣</span>
  )
}

export function Divider({ style }) {
  return <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '14px 0', ...style }} />
}

export function PageHeader({ title, onBack, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 16px', background: '#fff',
      borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          color: '#5a5a56', padding: '0 4px', lineHeight: 1,
        }}>←</button>
      )}
      <h1 style={{ flex: 1, fontSize: 17, fontWeight: 500 }}>{title}</h1>
      {action}
    </div>
  )
}
