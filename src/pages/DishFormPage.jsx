import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../hooks/useData.js'
import { Btn, Field, PageHeader, Toggle, Divider } from '../components/ui.jsx'
import { genId } from '../utils/helpers.js'

export default function DishFormPage() {
  const { id: storeId } = useParams()
  const navigate = useNavigate()
  const { createDish } = useStore(storeId)
  const [type, setType] = useState('single')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // 單品
  const [single, setSingle] = useState({ name: '', price: '', spicy: false, note: '' })

  // 套餐
  const [setName, setSetName] = useState('')
  const [setPrice, setSetPrice] = useState('')
  const [items, setItems] = useState([{ id: genId(), name: '', spicy: false }])

  const addItem = () => setItems(it => [...it, { id: genId(), name: '', spicy: false }])
  const removeItem = (id) => setItems(it => it.filter(i => i.id !== id))
  const updateItem = (id, k, v) => setItems(it => it.map(i => i.id === id ? { ...i, [k]: v } : i))

  const handleSubmit = async () => {
    setErr('')
    if (type === 'single') {
      if (!single.name.trim()) { setErr('請填寫餐點名稱'); return }
      setSaving(true)
      try {
        await createDish({ type: 'single', ...single, price: single.price ? Number(single.price) : null })
        navigate(-1)
      } catch (e) { setErr(e.message) }
      finally { setSaving(false) }
    } else {
      if (!setName.trim()) { setErr('請填寫套餐名稱'); return }
      if (!setPrice) { setErr('請填寫套餐總價'); return }
      const validItems = items.filter(i => i.name.trim())
      if (validItems.length === 0) { setErr('套餐至少需要一個項目'); return }
      setSaving(true)
      try {
        await createDish({ type: 'set', name: setName, price: Number(setPrice), items: validItems })
        navigate(-1)
      } catch (e) { setErr(e.message) }
      finally { setSaving(false) }
    }
  }

  return (
    <div>
      <PageHeader title="新增餐點" onBack={() => navigate(-1)} />
      <div style={{ padding: 16 }}>

        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[['single', '🍜 單品'], ['set', '🍱 套餐群組']].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)} style={{
              flex: 1, padding: '9px 0', borderRadius: 10, border: '0.5px solid',
              cursor: 'pointer', fontSize: 14, fontWeight: type === v ? 500 : 400, transition: 'all .15s',
              background: type === v ? '#FAECE7' : '#fff',
              borderColor: type === v ? '#D85A30' : 'rgba(0,0,0,0.12)',
              color: type === v ? '#712B13' : '#5a5a56',
            }}>{l}</button>
          ))}
        </div>

        {type === 'single' ? (
          <>
            <Field label="餐點名稱 *">
              <input value={single.name} onChange={e => setSingle(s => ({ ...s, name: e.target.value }))} placeholder="例：招牌乾麵" />
            </Field>
            <Field label="價格（元）">
              <input type="number" value={single.price} onChange={e => setSingle(s => ({ ...s, price: e.target.value }))} placeholder="60" inputMode="numeric" />
            </Field>
            <Field label="">
              <Toggle checked={single.spicy} onChange={v => setSingle(s => ({ ...s, spicy: v }))} label="🌶 此餐點可選辣度" />
              {single.spicy && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#FCEBEB', borderRadius: 8, fontSize: 12, color: '#791F1F' }}>
                  評分時將出現：小辣 / 中辣 / 大辣 選擇
                </div>
              )}
            </Field>
            <Field label="備註">
              <textarea value={single.note} onChange={e => setSingle(s => ({ ...s, note: e.target.value }))} placeholder="口味特色..." />
            </Field>
          </>
        ) : (
          <>
            <Field label="套餐名稱 *">
              <input value={setName} onChange={e => setSetName(e.target.value)} placeholder="例：三球冰淇淋套餐" />
            </Field>
            <Field label="套餐總價（元）*" hint="總價標在套餐上，內部項目不用分配">
              <input type="number" value={setPrice} onChange={e => setSetPrice(e.target.value)} placeholder="125" inputMode="numeric" />
            </Field>

            <Divider />
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>套餐內容</div>

            {items.map((item, idx) => (
              <div key={item.id} style={{
                padding: '12px', background: '#f5f4f0', borderRadius: 10,
                marginBottom: 8, borderLeft: '3px solid #EF9F27',
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    value={item.name}
                    onChange={e => updateItem(item.id, 'name', e.target.value)}
                    placeholder={`項目 ${idx + 1}，例：草莓球`}
                    style={{ flex: 1 }}
                  />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(item.id)} style={{
                      background: 'none', border: '0.5px solid rgba(0,0,0,0.15)',
                      borderRadius: 7, padding: '0 10px', cursor: 'pointer', color: '#9a9a94', fontSize: 16,
                    }}>×</button>
                  )}
                </div>
                <Toggle
                  checked={item.spicy}
                  onChange={v => updateItem(item.id, 'spicy', v)}
                  label="🌶 此項目可選辣度"
                />
              </div>
            ))}

            <button onClick={addItem} style={{
              width: '100%', padding: '9px', border: '1px dashed rgba(0,0,0,0.2)',
              borderRadius: 10, background: 'none', color: '#5a5a56', fontSize: 13,
              cursor: 'pointer', marginBottom: 4,
            }}>＋ 新增項目</button>
          </>
        )}

        {err && <div style={{ color: '#A32D2D', fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <Btn onClick={handleSubmit} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? '儲存中...' : '儲存餐點'}
        </Btn>
      </div>
    </div>
  )
}
