import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStores, useTags } from '../hooks/useData.js'
import { EmptyState, PriceTag } from '../components/ui.jsx'

function Stars({ val }) {
  if (val === null || val === undefined) return <span style={{ fontSize:12,color:'var(--text-3)',fontStyle:'italic' }}>尚無評分</span>
  return (
    <span style={{ display:'flex',alignItems:'center',gap:4 }}>
      <span style={{ color:'var(--gold)',fontSize:13 }}>{'★'.repeat(Math.round(val))}{'☆'.repeat(5-Math.round(val))}</span>
      <span style={{ fontSize:12,color:'var(--text-2)' }}>{Number(val).toFixed(1)}</span>
    </span>
  )
}

export default function StoresPage() {
  const navigate = useNavigate()
  const { stores, loading } = useStores()
  const { tags } = useTags()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [activeArea, setActiveArea] = useState('')
  const [sort, setSort] = useState('none')

  const areas = [...new Set(stores.map(s => s.area).filter(Boolean))]
  const filtered = stores.filter(s => {
    const matchSearch = !search || s.name.includes(search) || (s.area||'').includes(search)
    const matchTag = !activeTag || (s.tags||[]).includes(activeTag)
    const matchArea = !activeArea || s.area === activeArea
    return matchSearch && matchTag && matchArea
  }).sort((a, b) => {
    const av = a.storeStars || a.avgRating || 0
    const bv = b.storeStars || b.avgRating || 0
    if (sort === 'desc') return bv - av
    if (sort === 'asc') return av - bv
    return 0
  })

  return (
    <div style={{ minHeight:'100dvh',display:'flex',flexDirection:'column',background:'var(--cream)' }}>
      {/* Header */}
      <div style={{ background:'var(--surface)',borderBottom:'0.5px solid var(--cream-border)',padding:'20px 16px 14px',position:'sticky',top:0,zIndex:10 }}>
        <div style={{ textAlign:'center',marginBottom:14 }}>
          <div style={{ fontSize:10,letterSpacing:'0.3em',color:'var(--gold)',marginBottom:4,textTransform:'uppercase' }}>Private Collection</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,letterSpacing:'0.05em',color:'var(--text)' }}>
            米奇林指南
          </h1>
          <div style={{ display:'flex',alignItems:'center',gap:8,justifyContent:'center',margin:'6px 0' }}>
            <div style={{ flex:1,height:'0.5px',background:'var(--gold)',opacity:0.5 }}/>
            <span style={{ color:'var(--gold)',fontSize:12 }}>✦</span>
            <div style={{ flex:1,height:'0.5px',background:'var(--gold)',opacity:0.5 }}/>
          </div>
          <div style={{ fontSize:10,letterSpacing:'0.2em',color:'var(--text-3)',textTransform:'uppercase' }}>Guide Gastronomique</div>
        </div>

        <div style={{ display:'flex',gap:8,marginBottom:10 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋店家..." style={{ flex:1 }}/>
          <button onClick={()=>setSort(s=>s==='desc'?'asc':s==='asc'?'none':'desc')} style={{ flexShrink:0,padding:'0 10px',background:'var(--gold-light)',border:'0.5px solid var(--gold)',borderRadius:6,color:'var(--gold-dark)',fontSize:12,cursor:'pointer',whiteSpace:'nowrap' }}>{sort==='desc'?'⭐ 高→低':sort==='asc'?'⭐ 低→高':'排序'}</button>
          <button onClick={()=>navigate('/stores/new')} style={{ flexShrink:0,background:'var(--red)',border:'none',borderRadius:6,color:'#fff',fontSize:13,fontWeight:500,padding:'0 14px',cursor:'pointer',letterSpacing:'0.05em' }}>＋ 新增</button>
        </div>

        {areas.length > 0 && (
          <div style={{ display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:6 }}>
            <Chip label="全部地區" active={!activeArea} onClick={()=>setActiveArea('')}/>
            {areas.map(a=><Chip key={a} label={`📍 ${a}`} active={activeArea===a} onClick={()=>setActiveArea(activeArea===a?'':a)}/>)}
          </div>
        )}
        <div style={{ display:'flex',gap:6,overflowX:'auto',paddingBottom:2 }}>
          <Chip label="全部" active={!activeTag} onClick={()=>setActiveTag(null)}/>
          {tags.map(t=><Chip key={t.id} label={t.emoji?`${t.emoji} ${t.name}`:t.name} active={activeTag===t.id} onClick={()=>setActiveTag(activeTag===t.id?null:t.id)}/>)}
        </div>
      </div>

      <div style={{ padding:16,flex:1 }}>
        {loading ? <EmptyState icon="⏳" text="載入中..."/> : filtered.length===0 ? (
          <EmptyState icon="🍽️" text={search||activeTag||activeArea?'沒有符合的店家':'尚無收錄，請新增第一家'}/>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12 }}>
            {filtered.map(store=><StoreCard key={store.id} store={store} tags={tags} onClick={()=>navigate(`/stores/${store.id}`)}/>)}
          </div>
        )}
      </div>

      <nav style={{ position:'sticky',bottom:0,background:'var(--surface)',borderTop:'0.5px solid var(--cream-border)',display:'flex',justifyContent:'space-around',padding:'8px 0 max(8px,env(safe-area-inset-bottom))' }}>
        <NavItem icon="🏠" label="指南" active onClick={()=>navigate('/')}/>
        <NavItem icon="🏷️" label="標籤" onClick={()=>navigate('/tags')}/>
      </nav>
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ flexShrink:0,padding:'4px 12px',borderRadius:3,fontSize:11,border:'0.5px solid',cursor:'pointer',whiteSpace:'nowrap',letterSpacing:'0.05em',background:active?'var(--gold-light)':'var(--surface)',borderColor:active?'var(--gold)':'var(--border)',color:active?'var(--gold-dark)':'var(--text-2)',fontWeight:active?500:400 }}>{label}</button>
  )
}

function StoreCard({ store, tags, onClick }) {
  const avg = store.storeStars || store.avgRating || null
  const storeTags = (store.tags||[]).map(tid=>tags.find(t=>t.id===tid)).filter(Boolean)
  return (
    <div onClick={onClick} style={{ background:'var(--surface)',border:'0.5px solid var(--cream-border)',borderRadius:10,overflow:'hidden',cursor:'pointer',transition:'box-shadow .2s' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(100,80,40,0.12)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
      <div style={{ height:100,background:'var(--cream-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,overflow:'hidden' }}>
        {store.photoUrl?<img src={store.photoUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>:'🍽️'}
      </div>
      <div style={{ padding:'10px 12px' }}>
        <div style={{ fontSize:14,fontWeight:500,marginBottom:3,letterSpacing:'0.02em' }}>{store.name}</div>
        {store.area && <div style={{ fontSize:11,color:'var(--gold-dark)',marginBottom:5,letterSpacing:'0.05em' }}>📍 {store.area}</div>}
        <Stars val={avg}/>
        <div style={{ display:'flex',gap:4,marginTop:6,flexWrap:'wrap' }}>
          <PriceTag price={store.priceRange}/>
          {storeTags.slice(0,2).map(t=>(
            <span key={t.id} style={{ fontSize:10,padding:'2px 6px',borderRadius:3,background:'var(--gold-light)',color:'var(--gold-dark)',border:'0.5px solid var(--cream-border)' }}>
              {t.emoji?`${t.emoji} `:''}{t.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background:'none',border:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'4px 20px',cursor:'pointer',color:active?'var(--gold)':'var(--text-3)',fontSize:10,letterSpacing:'0.1em' }}>
      <span style={{ fontSize:22 }}>{icon}</span>{label}
    </button>
  )
}
