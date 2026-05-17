import { SPICY_LEVELS } from '../utils/helpers.js'

export function Btn({ variant = 'primary', onClick, children, style, type = 'button', disabled }) {
  const base = { display:'flex',alignItems:'center',justifyContent:'center',gap:6,width:'100%',padding:'11px 14px',borderRadius:6,fontSize:14,fontWeight:500,border:'1px solid',transition:'all .15s',cursor:'pointer',letterSpacing:'0.05em' }
  const variants = {
    primary: { background:'var(--red)',borderColor:'var(--red)',color:'#fff' },
    outline: { background:'transparent',borderColor:'var(--red)',color:'var(--red)' },
    ghost: { background:'transparent',borderColor:'var(--border-mid)',color:'var(--text-2)' },
    gold: { background:'var(--gold)',borderColor:'var(--gold)',color:'#fff' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...(variants[variant]||variants.primary), opacity:disabled?0.5:1, ...style }}>
      {children}
    </button>
  )
}

export function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block',fontSize:11,color:'var(--text-2)',marginBottom:6,letterSpacing:'0.1em',textTransform:'uppercase' }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize:11,color:'var(--text-3)',marginTop:4 }}>{hint}</div>}
    </div>
  )
}

export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'var(--surface)',border:'0.5px solid var(--cream-border)',borderRadius:'12px',overflow:'hidden',...style }}>
      {children}
    </div>
  )
}

export function StarRating({ value = 0, onChange, size = 24 }) {
  return (
    <div style={{ display:'flex',gap:3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange?.(n)}
          style={{ fontSize:size,lineHeight:1,cursor:onChange?'pointer':'default',color:n<=value?'var(--gold)':'var(--border-mid)',transition:'transform .1s,color .1s' }}
          onMouseEnter={e => { if(onChange) e.target.style.transform='scale(1.2)' }}
          onMouseLeave={e => { e.target.style.transform='scale(1)' }}>★</span>
      ))}
    </div>
  )
}

export function SpicyPicker({ value, onChange }) {
  return (
    <div style={{ display:'flex',gap:5,padding:'8px 14px',background:'#FDF0F0',borderTop:'0.5px solid var(--border)',alignItems:'center' }}>
      <span style={{ fontSize:12,color:'#7A1A1A',flex:1 }}>🌶 辣度</span>
      {SPICY_LEVELS.map(lv => (
        <button key={lv} onClick={() => onChange(lv===value?null:lv)}
          style={{ padding:'3px 10px',borderRadius:4,fontSize:12,border:'0.5px solid #C87070',cursor:'pointer',transition:'all .15s',background:value===lv?'#8B1A1A':'#fff',color:value===lv?'#fff':'#8B1A1A',fontWeight:value===lv?500:400 }}>{lv}</button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',userSelect:'none' }}>
      <span style={{ fontSize:14,flex:1,color:'var(--text)' }}>{label}</span>
      <span style={{ position:'relative',width:40,height:22,display:'inline-block',background:checked?'var(--gold)':'var(--border-mid)',borderRadius:11,transition:'background .2s',flexShrink:0 }}>
        <span style={{ position:'absolute',top:3,left:checked?19:3,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'left .2s' }}/>
        <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{ position:'absolute',opacity:0,width:'100%',height:'100%',cursor:'pointer',margin:0 }}/>
      </span>
    </label>
  )
}

export function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:'center',padding:'50px 20px',color:'var(--text-3)' }}>
      <div style={{ fontSize:40,marginBottom:10 }}>{icon}</div>
      <div style={{ fontSize:14,fontStyle:'italic' }}>{text}</div>
    </div>
  )
}

export function PriceTag({ price }) {
  const map = { low:'$',mid:'$$',high:'$$$',vhigh:'$$$$' }
  const label = { low:'100以下',mid:'100–300',high:'300–600',vhigh:'600以上' }
  if (!price) return null
  return (
    <span style={{ fontSize:11,padding:'2px 8px',borderRadius:4,background:'var(--gold-light)',color:'var(--gold-dark)',fontWeight:500,border:'0.5px solid var(--cream-border)' }}>
      {map[price]} {label[price]}
    </span>
  )
}

export function SpicyBadge() {
  return <span style={{ fontSize:11,padding:'2px 7px',borderRadius:4,background:'#FDF0F0',color:'#8B1A1A',border:'0.5px solid #DDB0B0' }}>🌶 可辣</span>
}

export function Divider({ style }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10,margin:'16px 0',...style }}>
      <div style={{ flex:1,height:'0.5px',background:'var(--gold)',opacity:0.4 }}/>
      <span style={{ color:'var(--gold)',fontSize:14,opacity:0.6 }}>✦</span>
      <div style={{ flex:1,height:'0.5px',background:'var(--gold)',opacity:0.4 }}/>
    </div>
  )
}

export function PageHeader({ title, onBack, action }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 16px',background:'var(--surface)',borderBottom:'0.5px solid var(--cream-border)',position:'sticky',top:0,zIndex:10 }}>
      {onBack && <button onClick={onBack} style={{ background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--text-2)',padding:'0 4px',lineHeight:1 }}>←</button>}
      <h1 style={{ flex:1,fontSize:16,fontWeight:500,letterSpacing:'0.05em' }}>{title}</h1>
      {action}
    </div>
  )
}
