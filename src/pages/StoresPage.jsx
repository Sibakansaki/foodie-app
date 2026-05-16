import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStores } from '../hooks/useData.js'
import { useTags } from '../hooks/useData.js'
import { Card, EmptyState, PriceTag } from '../components/ui.jsx'
import { avgRating } from '../utils/helpers.js'

function Stars({ val }) {
  if (val === null) return <span style={{ fontSize: 12, color: '#9a9a94' }}>尚無評分</span>
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#EF9F27', fontSize: 14 }}>
        {'★'.repeat(Math.round(val))}{'☆'.repeat(5 - Math.round(val))}
      </span>
      <span style={{ fontSize: 12, color: '#5a5a56' }}>{val.toFixed(1)}</span>
    </span>
  )
}

export default function StoresPage() {
  const navigate = useNavigate()
  const { stores, loading } = useStores()
  const { tags } = useTags()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  const filtered = stores.filter(s => {
    const matchSearch = !search || s.name.includes(search) || (s.address || '').includes(search)
    const matchTag = !activeTag || (s.tags || []).includes(activeTag)
    return matchSearch && matchTag
  })

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        padding: '14px 16px', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>
            好食<span style={{ color: '#D85A30' }}>記</span>
          </h1>
          <button
            onClick={() => navigate('/stores/new')}
            style={{
              background: '#D85A30', border: 'none', borderRadius: 10,
              color: '#fff', fontSize: 13, fontWeight: 500, padding: '7px 14px', cursor: 'pointer',
            }}
          >＋ 新增店家</button>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜尋店家名稱或地址..."
          style={{ marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <TagChip label="全部" active={!activeTag} onClick={() => setActiveTag(null)} />
          {tags.map(t => (
            <TagChip key={t.id} label={t.emoji ? `${t.emoji} ${t.name}` : t.name}
              active={activeTag === t.id} onClick={() => setActiveTag(activeTag === t.id ? null : t.id)} />
          ))}
        </div>
      </div>

      <div style={{ padding: 16, flex: 1 }}>
        {loading ? (
          <EmptyState icon="⏳" text="載入中..." />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🍽️" text={search || activeTag ? '沒有符合的店家' : '還沒有店家，點右上角新增吧！'} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {filtered.map(store => (
              <StoreCard key={store.id} store={store} onClick={() => navigate(`/stores/${store.id}`)} />
            ))}
          </div>
        )}
      </div>

      <nav style={{
        position: 'sticky', bottom: 0, background: '#fff',
        borderTop: '0.5px solid rgba(0,0,0,0.08)',
        display: 'flex', justifyContent: 'space-around', padding: '8px 0 max(8px,env(safe-area-inset-bottom))',
      }}>
        <NavItem icon="🏠" label="探索" active onClick={() => navigate('/')} />
        <NavItem icon="🏷️" label="標籤" onClick={() => navigate('/tags')} />
      </nav>
    </div>
  )
}

function TagChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '0.5px solid',
      cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
      background: active ? '#FAECE7' : '#fff',
      borderColor: active ? '#D85A30' : 'rgba(0,0,0,0.12)',
      color: active ? '#712B13' : '#5a5a56',
      fontWeight: active ? 500 : 400,
    }}>{label}</button>
  )
}

function StoreCard({ store, onClick }) {
  const avg = store.avgRating ?? null
  return (
    <Card style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{
        height: 100, background: '#f5f4f0', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 44, position: 'relative',
      }}>
        {store.photoUrl
          ? <img src={store.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '🍽️'
        }
        {store.tags?.[0] && (() => {
          return null // tags shown in body
        })()}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{store.name}</div>
        <div style={{ fontSize: 11, color: '#9a9a94', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {store.address || '未填地址'}
        </div>
        <Stars val={avg} />
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          <PriceTag price={store.priceRange} />
        </div>
      </div>
    </Card>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 2, padding: '4px 20px', cursor: 'pointer',
      color: active ? '#D85A30' : '#9a9a94', fontSize: 11,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      {label}
    </button>
  )
}
