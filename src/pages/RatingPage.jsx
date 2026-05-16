import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useData.js'
import { PageHeader, StarRating, SpicyPicker, Card, Btn } from '../components/ui.jsx'
import { genId } from '../utils/helpers.js'

export default function RatingPage() {
  const { id: storeId } = useParams()
  const navigate = useNavigate()
  const { store, dishes, createRating } = useStore(storeId)
  const [items, setItems] = useState({})
  const [overallStars, setOverallStars] = useState(0)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const setItemField = (key, field, value) => {
    setItems(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const ratingItems = []

      dishes.forEach(dish => {
        if (dish.type === 'single') {
          const d = items[dish.id] || {}
          if (d.stars || d.spicyLevel) {
            ratingItems.push({
              dishId: dish.id,
              name: dish.name,
              type: 'single',
              stars: d.stars || 0,
              spicyLevel: d.spicyLevel || null,
            })
          }
        } else if (dish.type === 'set') {
          const setData = items[`set_${dish.id}`] || {}
          const setEntry = {
            dishId: dish.id,
            name: dish.name,
            type: 'set',
            stars: setData.stars || 0,
          }
          const subItems = (dish.items || []).map((item, i) => {
            const key = `set_${dish.id}_item_${i}`
            const d = items[key] || {}
            return { name: item.name, stars: d.stars || 0, spicyLevel: d.spicyLevel || null }
          }).filter(i => i.stars || i.spicyLevel)
          setEntry.subItems = subItems
          if (setData.stars || subItems.length > 0) ratingItems.push(setEntry)
        }
      })

      await createRating({
        id: genId(),
        storeId,
        overallStars,
        items: ratingItems,
        note,
        createdAt: new Date().toISOString(),
      })
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  const singles = dishes.filter(d => d.type === 'single')
  const sets = dishes.filter(d => d.type === 'set')

  return (
    <div>
      <PageHeader title={`評分：${store?.name || ''}`} onBack={() => navigate(-1)} />
      <div style={{ padding: 16 }}>

        <Card style={{ marginBottom: 14 }}>
          <div style={{ padding: '12px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, color: '#5a5a56', marginBottom: 8 }}>整體評分（選填）</div>
            <StarRating value={overallStars} onChange={setOverallStars} size={28} />
          </div>
          <div style={{ padding: '10px 14px' }}>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder="這次用餐心得..." style={{ width: '100%' }} />
          </div>
        </Card>

        {singles.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#9a9a94', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              單品
            </div>
            {singles.map(dish => (
              <SingleRatingBlock
                key={dish.id}
                dish={dish}
                data={items[dish.id] || {}}
                onChange={(f, v) => setItemField(dish.id, f, v)}
              />
            ))}
          </>
        )}

        {sets.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#9a9a94', letterSpacing: '.06em', textTransform: 'uppercase', margin: '14px 0 8px' }}>
              套餐
            </div>
            {sets.map(set => (
              <SetRatingBlock
                key={set.id}
                set={set}
                setData={items[`set_${set.id}`] || {}}
                onSetChange={(f, v) => setItemField(`set_${set.id}`, f, v)}
                getItemData={i => items[`set_${set.id}_item_${i}`] || {}}
                onItemChange={(i, f, v) => setItemField(`set_${set.id}_item_${i}`, f, v)}
              />
            ))}
          </>
        )}

        {dishes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#9a9a94', fontSize: 14 }}>
            還沒有餐點，先去新增餐點再來評分
          </div>
        )}

        <Btn onClick={handleSubmit} disabled={saving} style={{ marginTop: 16 }}>
          {saving ? '儲存中...' : '儲存這次評分'}
        </Btn>
      </div>
    </div>
  )
}

function SingleRatingBlock({ dish, data, onChange }) {
  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{dish.name}</span>
          {dish.price && <span style={{ fontSize: 12, color: '#9a9a94', marginLeft: 8 }}>${dish.price}</span>}
        </div>
        <StarRating value={data.stars || 0} onChange={v => onChange('stars', v)} />
      </div>
      {dish.spicy && <SpicyPicker value={data.spicyLevel} onChange={v => onChange('spicyLevel', v)} />}
    </Card>
  )
}

function SetRatingBlock({ set, setData, onSetChange, getItemData, onItemChange }) {
  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ padding: '10px 14px', background: '#FAEEDA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#633806' }}>{set.name}</span>
        <span style={{ fontSize: 12, color: '#854F0B' }}>套餐 ${set.price}</span>
      </div>

      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#5a5a56' }}>套餐整體評分</span>
        <StarRating value={setData.stars || 0} onChange={v => onSetChange('stars', v)} />
      </div>

      {(set.items || []).map((item, i) => {
        const d = getItemData(i)
        return (
          <div key={i} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{
              padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderLeft: '3px solid #EF9F27',
            }}>
              <span style={{ fontSize: 13 }}>{item.name}</span>
              <StarRating value={d.stars || 0} onChange={v => onItemChange(i, 'stars', v)} size={20} />
            </div>
            {item.spicy && <SpicyPicker value={d.spicyLevel} onChange={v => onItemChange(i, 'spicyLevel', v)} />}
          </div>
        )
      })}
    </Card>
  )
}
