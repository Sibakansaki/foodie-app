import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTags } from '../hooks/useData.js'
import { PageHeader, Btn, Divider } from '../components/ui.jsx'
import { genId } from '../utils/helpers.js'

export default function TagsPage() {
  const navigate = useNavigate()
  const { tags, saveTags } = useTags()
  const [localTags, setLocalTags] = useState(tags)
  const [emoji, setEmoji] = useState('')
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const preview = `${emoji ? emoji + ' ' : ''}${name}`

  const addTag = () => {
    if (!name.trim()) return
    setLocalTags(t => [...t, { id: genId(), emoji: emoji.trim(), name: name.trim() }])
    setEmoji('')
    setName('')
  }

  const removeTag = (id) => setLocalTags(t => t.filter(tag => tag.id !== id))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveTags(localTags)
      navigate(-1)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="標籤管理" onBack={() => navigate(-1)} />
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 13, color: '#5a5a56', marginBottom: 16 }}>
          所有標籤完全手動管理，可加 emoji 前綴，用於店家分類
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, minHeight: 40 }}>
          {localTags.length === 0 && (
            <span style={{ fontSize: 13, color: '#9a9a94' }}>尚無標籤</span>
          )}
          {localTags.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', border: '0.5px solid rgba(0,0,0,0.15)',
              borderRadius: 20, background: '#fff', fontSize: 13,
            }}>
              <span>{t.emoji ? `${t.emoji} ` : ''}{t.name}</span>
              <button onClick={() => removeTag(t.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9a9a94', fontSize: 16, lineHeight: 1, padding: 0,
              }}>×</button>
            </div>
          ))}
        </div>

        <Divider />
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>新增標籤</div>

        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#5a5a56', marginBottom: 5 }}>Emoji</label>
            <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🍜" style={{ textAlign: 'center', fontSize: 20 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#5a5a56', marginBottom: 5 }}>標籤名稱</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例：台式"
              onKeyDown={e => e.key === 'Enter' && addTag()} />
          </div>
        </div>

        {preview.trim() && (
          <div style={{ fontSize: 13, color: '#5a5a56', marginBottom: 10 }}>
            預覽：
            <span style={{
              marginLeft: 6, padding: '3px 10px', borderRadius: 20, fontSize: 13,
              background: '#FAECE7', border: '0.5px solid #D85A30', color: '#712B13',
            }}>{preview}</span>
          </div>
        )}

        <Btn variant="outline" onClick={addTag} style={{ marginBottom: 20 }}>
          ＋ 新增標籤
        </Btn>

        <Btn onClick={handleSave} disabled={saving}>
          {saving ? '儲存中...' : '儲存所有標籤'}
        </Btn>
      </div>
    </div>
  )
}
