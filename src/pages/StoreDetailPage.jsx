import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useData.js'
import { Card, PageHeader, PriceTag, SpicyBadge, Divider, EmptyState } from '../components/ui.jsx'
import { avgRating } from '../utils/helpers.js'

function StarDisplay({ val, count }) {
  if (val === null) return <span style={{ fontSize: 13, color: '#9a9a94' }}>尚無評分</span>
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ color: '#EF9F27', fontSize: 16 }}>
        {'★'.repeat(Math.round(val))}{'☆'.repeat(5 - Math.round(val))}
      </span>
      <span style={{ fontSize: 13, color: '#5a5a56', fontWeight: 500 }}>{val.toFixed(1)}</span>
      {count > 0 && <span style={{ fontSize: 12, color: '#9a9a94' }}>({count} 則)</span>}
    </span>
  )
}

export default function StoreDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { store, dishes, ratings, loading } = useStore(id)
  const [tab, setTab] = useState('dishes')

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9a9a94' }}>載入中...</div>
  if (!store) return <div style={{ padding: 40, textAlign: 'center' }}>找不到店家</div>

  const storeRatings = ratings.filter(r => r.storeId === id)
  const avg = avgRating(storeRatings.map(r => ({ stars: r.overallStars || 0 })).filter(r => r.stars > 0))

  return (
    <div>
      <PageHeader
        title={store.name}
        onBack={() => navigate('/')}
        action={
          <button onClick={() => navigate(`/stores/${id}/edit`)}
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#5a5a56', cursor: 'pointer' }}>
            編輯
          </button>
        }
      />

      {store.photoUrl && (
        <div style={{ height: 180, overflow: 'hidden' }}>
          <img src={store.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
          <PriceTag price={store.priceRange} />
          {store.mapsUrl && (
            <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#185FA5', display: 'flex', alignItems: 'center', gap: 3 }}>
              🗺️ Google Maps
            </a>
          )}
        </div>
        {store.address && <div style={{ fontSize: 13, color: '#5a5a56', marginBottom: 6 }}>📍 {store.address}</div>}
        <StarDisplay val={avg} count={storeRatings.length} />
        {store.note && <div style={{ fontSize: 13, color: '#5a5a56', marginTop: 8 }}>{store.note}</div>}
      </div>

      <div style={{ display: 'flex', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        {['dishes', 'ratings'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '11px 0', background: 'none', border: 'none',
            borderBottom: tab === t ? '2px solid #D85A30' : '2px solid transparent',
            fontSize: 14, fontWeight: tab === t ? 500 : 400,
            color: tab === t ? '#D85A30' : '#5a5a56', cursor: 'pointer',
          }}>
            {t === 'dishes' ? '餐點' : '評分記錄'}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {tab === 'dishes' ? (
          <DishesTab dishes={dishes} storeId={id} navigate={navigate} />
        ) : (
          <RatingsTab ratings={storeRatings} dishes={dishes} />
        )}
      </div>
    </div>
  )
}

function DishesTab({ dishes, storeId, navigate }) {
  const singles = dishes.filter(d => d.type === 'single')
  const sets = dishes.filter(d => d.type === 'set')

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#5a5a56' }}>所有餐點</span>
        <button onClick={() => navigate(`/stores/${storeId}/dishes/new`)}
          style={{
            background: '#D85A30', border: 'none', borderRadius: 8, color: '#fff',
            fontSize: 12, fontWeight: 500, padding: '6px 12px', cursor: 'pointer',
          }}>
          ＋ 新增
        </button>
      </div>

      {dishes.length === 0 && <EmptyState icon="🍜" text="還沒有餐點，點右上角新增" />}

      {singles.map(d => <SingleDishRow key={d.id} dish={d} />)}

      {sets.map(set => (
        <div key={set.id} style={{ marginBottom: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 13px', background: '#FAEEDA', borderRadius: 10, marginBottom: 5,
          }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#633806' }}>
              {set.name}
            </span>
            <span style={{
              fontSize: 12, color: '#854F0B', background: '#fff',
              border: '0.5px solid #EF9F27', borderRadius: 10, padding: '2px 8px',
            }}>套餐 ${set.price}</span>
          </div>
          {(set.items || []).map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 13px', marginBottom: 4, marginLeft: 12,
              background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
              borderLeft: '2px solid #EF9F27', borderRadius: '0 8px 8px 0',
            }}>
              <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
              {item.spicy && <SpicyBadge />}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() => navigate(`/stores/${storeId}/rate`)}
        style={{
          marginTop: 16, width: '100%', padding: 12, border: '0.5px solid #D85A30',
          borderRadius: 10, background: 'none', color: '#712B13', fontSize: 14,
          fontWeight: 500, cursor: 'pointer',
        }}>
        ✏️ 記錄今天的評分
      </button>
    </>
  )
}

function SingleDishRow({ dish }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px',
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, marginBottom: 6,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{dish.name}</div>
        {dish.note && <div style={{ fontSize: 11, color: '#9a9a94', marginTop: 2 }}>{dish.note}</div>}
      </div>
      {dish.spicy && <SpicyBadge />}
      <div style={{ fontSize: 13, color: '#5a5a56', minWidth: 36, textAlign: 'right' }}>
        {dish.price ? `$${dish.price}` : '—'}
      </div>
    </div>
  )
}

function RatingsTab({ ratings, dishes }) {
  if (ratings.length === 0) return <EmptyState icon="⭐" text="還沒有評分記錄" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...ratings].reverse().map(r => (
        <RatingCard key={r.id} rating={r} dishes={dishes} />
      ))}
    </div>
  )
}

function RatingCard({ rating, dishes }) {
  const date = new Date(rating.createdAt).toLocaleDateString('zh-TW')
  return (
    <Card>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#5a5a56' }}>{date}</span>
        {rating.overallStars > 0 && (
          <span style={{ color: '#EF9F27', fontSize: 14 }}>
            {'★'.repeat(rating.overallStars)}{'☆'.repeat(5 - rating.overallStars)}
          </span>
        )}
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(rating.items || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
            {item.spicyLevel && (
              <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 8, background: '#FCEBEB', color: '#A32D2D' }}>
                🌶{item.spicyLevel}
              </span>
            )}
            {item.stars > 0 && (
              <span style={{ color: '#EF9F27', fontSize: 13 }}>{'★'.repeat(item.stars)}</span>
            )}
          </div>
        ))}
        {rating.note && <div style={{ fontSize: 12, color: '#9a9a94', marginTop: 4 }}>{rating.note}</div>}
      </div>
    </Card>
  )
}
