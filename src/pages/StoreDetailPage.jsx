import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, useStores } from '../hooks/useData.js'
import { Card, PriceTag, SpicyBadge, EmptyState, StarRating } from '../components/ui.jsx'
import { SPICY_LEVELS } from '../utils/helpers.js'

export default function StoreDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { store, dishes, loading, deleteDish, updateDish } = useStore(id)
  const { deleteStore } = useStores()
  const [editingDish, setEditingDish] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9a9a94' }}>載入中...</div>
  if (!store) return <div style={{ padding: 40, textAlign: 'center' }}>找不到店家</div>

  const handleDeleteStore = async () => {
    await deleteStore(id)
    navigate('/')
  }

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('確定刪除這個餐點？')) return
    await deleteDish(dishId)
  }

  const handleUpdateDish = async (dish) => {
    await updateDish(dish.id, dish)
    setEditingDish(null)
  }

  const singles = dishes.filter(d => d.type === 'single')
  const sets = dishes.filter(d => d.type === 'set')

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px', background: '#fff',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          color: '#5a5a56', padding: '0 4px', lineHeight: 1,
        }}>←</button>
        <h1 style={{ flex: 1, fontSize: 17, fontWeight: 500 }}>{store.name}</h1>
        <button onClick={() => navigate(`/stores/${id}/edit`)}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#5a5a56', cursor: 'pointer', marginRight: 8 }}>
          編輯
        </button>
        <button onClick={() => setConfirmDelete(true)}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#A32D2D', cursor: 'pointer' }}>
          刪除
        </button>
      </div>

      {confirmDelete && (
        <div style={{
          margin: 16, padding: 16, background: '#FCEBEB', borderRadius: 10,
          border: '0.5px solid #F09595',
        }}>
          <div style={{ fontSize: 14, color: '#791F1F', marginBottom: 12 }}>確定要刪除「{store.name}」？此操作無法復原。</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleDeleteStore} style={{
              flex: 1, padding: '9px', background: '#E24B4A', border: 'none',
              borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>確定刪除</button>
            <button onClick={() => setConfirmDelete(false)} style={{
              flex: 1, padding: '9px', background: '#fff', border: '0.5px solid rgba(0,0,0,0.15)',
              borderRadius: 8, color: '#5a5a56', fontSize: 13, cursor: 'pointer',
            }}>取消</button>
          </div>
        </div>
      )}

      {store.photoUrl && (
        <div style={{ height: 180, overflow: 'hidden' }}>
          <img src={store.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
          <PriceTag price={store.priceRange} />
          {store.mapsUrl && (
            <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#185FA5', display: 'flex', alignItems: 'center', gap: 3 }}>
              🗺️ Google Maps
            </a>
          )}
        </div>
        {store.address && <div style={{ fontSize: 13, color: '#5a5a56', marginBottom: 4 }}>📍 {store.address}</div>}
        {store.note && <div style={{ fontSize: 13, color: '#5a5a56' }}>{store.note}</div>}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>餐點</span>
          <button onClick={() => navigate(`/stores/${id}/dishes/new`)}
            style={{
              background: '#D85A30', border: 'none', borderRadius: 8, color: '#fff',
              fontSize: 12, fontWeight: 500, padding: '6px 12px', cursor: 'pointer',
            }}>
            ＋ 新增餐點
          </button>
        </div>

        {dishes.length === 0 && <EmptyState icon="🍜" text="還沒有餐點，點右上角新增" />}

        {singles.map(d => (
          editingDish?.id === d.id
            ? <EditDishCard key={d.id} dish={editingDish} onChange={setEditingDish} onSave={() => handleUpdateDish(editingDish)} onCancel={() => setEditingDish(null)} />
            : <DishRow key={d.id} dish={d} onEdit={() => setEditingDish({ ...d })} onDelete={() => handleDeleteDish(d.id)} />
        ))}

        {sets.map(set => (
          <div key={set.id} style={{ marginBottom: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 13px', background: '#FAEEDA', borderRadius: 10, marginBottom: 5,
            }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#633806' }}>{set.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 12, color: '#854F0B', background: '#fff',
                  border: '0.5px solid #EF9F27', borderRadius: 10, padding: '2px 8px',
                }}>套餐 ${set.price}</span>
                <button onClick={() => setEditingDish({ ...set })} style={{ background: 'none', border: 'none', fontSize: 12, color: '#854F0B', cursor: 'pointer' }}>編輯</button>
                <button onClick={() => handleDeleteDish(set.id)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#A32D2D', cursor: 'pointer' }}>刪除</button>
              </div>
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
                {item.spicyLevel && (
                  <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 8, background: '#FCEBEB', color: '#A32D2D' }}>
                    🌶 {item.spicyLevel}
                  </span>
                )}
                {item.stars > 0 && (
                  <span style={{ color: '#EF9F27', fontSize: 13 }}>{'★'.repeat(item.stars)}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DishRow({ dish, onEdit, onDelete }) {
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
      {dish.spicyLevel && (
        <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 8, background: '#FCEBEB', color: '#A32D2D' }}>
          🌶 {dish.spicyLevel}
        </span>
      )}
      {dish.stars > 0 && (
        <span style={{ color: '#EF9F27', fontSize: 16 }}>{'★'.repeat(dish.stars)}</span>
      )}
      <div style={{ fontSize: 13, color: '#5a5a56', minWidth: 36, textAlign: 'right' }}>
        {dish.price ? `$${dish.price}` : '—'}
      </div>
      <button onClick={onEdit} style={{ background: 'none', border: 'none', fontSize: 12, color: '#5a5a56', cursor: 'pointer' }}>編輯</button>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', fontSize: 12, color: '#A32D2D', cursor: 'pointer' }}>刪除</button>
    </div>
  )
}

function EditDishCard({ dish, onChange, onSave, onCancel }) {
  return (
    <div style={{
      padding: 14, background: '#f5f4f0', borderRadius: 10, marginBottom: 8,
      border: '1px solid #D85A30',
    }}>
      <div style={{ marginBottom: 8 }}>
        <input value={dish.name} onChange={e => onChange({ ...dish, name: e.target.value })}
          placeholder="餐點名稱" style={{ width: '100%', marginBottom: 6 }} />
        <input type="number" value={dish.price || ''} onChange={e => onChange({ ...dish, price: e.target.value })}
          placeholder="價格" inputMode="numeric" style={{ width: '100%', marginBottom: 6 }} />
        <textarea value={dish.note || ''} onChange={e => onChange({ ...dish, note: e.target.value })}
          placeholder="備註" style={{ width: '100%', height: 60, marginBottom: 6 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13 }}>評分</span>
        <StarRating value={dish.stars || 0} onChange={v => onChange({ ...dish, stars: v })} size={24} />
      </div>

      {dish.spicy && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {SPICY_LEVELS.map(lv => (
            <button key={lv} onClick={() => onChange({ ...dish, spicyLevel: dish.spicyLevel === lv ? null : lv })}
              style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 12, border: '0.5px solid #F09595',
                cursor: 'pointer',
                background: dish.spicyLevel === lv ? '#E24B4A' : '#fff',
                color: dish.spicyLevel === lv ? '#fff' : '#A32D2D',
              }}>{lv}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onSave} style={{
          flex: 1, padding: '9px', background: '#D85A30', border: 'none',
          borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>儲存</button>
        <button onClick={onCancel} style={{
          flex: 1, padding: '9px', background: '#fff', border: '0.5px solid rgba(0,0,0,0.15)',
          borderRadius: 8, color: '#5a5a56', fontSize: 13, cursor: 'pointer',
        }}>取消</button>
      </div>
    </div>
  )
}
