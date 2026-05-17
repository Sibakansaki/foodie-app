import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStores, useTags } from '../hooks/useData.js'
import { Btn, Field } from '../components/ui.jsx'
import { genId, fileToBase64 } from '../utils/helpers.js'
import { api } from '../utils/api.js'

const PRICES = [
  { value: 'low', label: '$', sub: '100以下' },
  { value: 'mid', label: '$$', sub: '100–300' },
  { value: 'high', label: '$$$', sub: '300–600' },
  { value: 'vhigh', label: '$$$$', sub: '600以上' },
]

export default function StoreFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { stores, createStore, updateStore } = useStores()
  const { tags } = useTags()
  const isEdit = !!id && id !== 'new'
  const editStore = isEdit ? stores.find(s => s.id === id) : null

  const [form, setForm] = useState({ name: '', area: '', address: '', mapsUrl: '', priceRange: '', tags: [], note: '' })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (editStore) {
      setForm({ name: editStore.name || '', area: editStore.area || '', address: editStore.address || '', mapsUrl: editStore.mapsUrl || '', priceRange: editStore.priceRange || '', tags: editStore.tags || [], note: editStore.note || '' })
      if (editStore.photoUrl) setPhotoPreview(editStore.photoUrl)
    }
  }, [editStore?.id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleTag = (tid) => set('tags', form.tags.includes(tid) ? form.tags.filter(t => t !== tid) : [...form.tags, tid])

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setPhoto(file)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErr('請填寫店家名稱'); return }
    setSaving(true)
    try {
      let photoUrl = editStore?.photoUrl || null
      if (photo === 'DELETE') { photoUrl = null }
      else if (photo) {
        const b64 = await fileToBase64(photo)
        const res = await api.uploadPhoto(editStore?.id || genId(), b64, photo.name)
        photoUrl = res.url
      }
      const data = { ...form, photoUrl }
      if (isEdit) { await updateStore(id, data) } else { await createStore(data) }
      navigate(-1)
    } catch (e) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#5a5a56', padding: '0 4px', lineHeight: 1 }}>←</button>
        <h1 style={{ flex: 1, fontSize: 17, fontWeight: 500 }}>{isEdit ? '編輯店家' : '新增店家'}</h1>
      </div>
      <div style={{ padding: 16 }}>
        <Field label="店家名稱 *"><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="例：阿嬤的麵攤"/></Field>
        <Field label="地區" hint="例：台中、台北、東區..."><input value={form.area} onChange={e => set('area', e.target.value)} placeholder="例：台中市中區"/></Field>
        <Field label="Google Maps 連結"><input value={form.mapsUrl} onChange={e => set('mapsUrl', e.target.value)} type="url" placeholder="https://maps.app.goo.gl/..."/></Field>
        <Field label="地址"><input value={form.address} onChange={e => set('address', e.target.value)} placeholder="台中市中區中山路20號"/></Field>

        <Field label="價位範圍">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {PRICES.map(p => (
              <button key={p.value} onClick={() => set('priceRange', form.priceRange === p.value ? '' : p.value)} style={{ padding: '8px 4px', borderRadius: 8, border: '0.5px solid', cursor: 'pointer', textAlign: 'center', fontSize: 12, background: form.priceRange === p.value ? '#E1F5EE' : '#fff', borderColor: form.priceRange === p.value ? '#1D9E75' : 'rgba(0,0,0,0.12)', color: form.priceRange === p.value ? '#085041' : '#5a5a56', fontWeight: form.priceRange === p.value ? 500 : 400 }}>
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{p.sub}</div>
              </button>
            ))}
          </div>
        </Field>

        <Field label="類型標籤">
          {tags.length === 0 ? <div style={{ fontSize: 12, color: '#9a9a94' }}>尚無標籤，請先到標籤管理新增</div> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(t => { const on = form.tags.includes(t.id); return (
                <button key={t.id} onClick={() => toggleTag(t.id)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 13, border: '0.5px solid', cursor: 'pointer', background: on ? '#FAECE7' : '#fff', borderColor: on ? '#D85A30' : 'rgba(0,0,0,0.12)', color: on ? '#712B13' : '#5a5a56', fontWeight: on ? 500 : 400 }}>
                  {t.emoji ? `${t.emoji} ` : ''}{t.name}
                </button>
              )})}
            </div>
          )}
        </Field>

        <Field label="店家照片">
          <label style={{ display: 'block', cursor: 'pointer' }}>
            {photoPreview ? <img src={photoPreview} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }}/> : (
              <div style={{ border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9a9a94', fontSize: 13 }}>
                <span style={{ fontSize: 28 }}>📷</span>點擊上傳照片
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }}/>
          </label>
        </Field>

        <Field label="備註"><textarea value={form.note} onChange={e => set('note', e.target.value)} placeholder="推薦菜色、注意事項..."/></Field>
        {err && <div style={{ color: '#A32D2D', fontSize: 13, marginBottom: 10 }}>{err}</div>}
        <Btn onClick={handleSubmit} disabled={saving}>{saving ? '儲存中...' : (isEdit ? '儲存變更' : '新增店家')}</Btn>
      </div>
    </div>
  )
}
