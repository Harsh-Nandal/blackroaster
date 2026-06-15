'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'

const INPUT = { padding: '9px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
const LABEL = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }
const BTN = { fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', border: 'none', cursor: 'pointer' }

function CategoryModal({ category, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image: category?.image || '',
    parent: category?.parent?._id || category?.parent || '',
    isActive: category?.isActive !== false,
    displayOrder: category?.displayOrder || 0,
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'luxwall/categories')
      const { data } = await axios.post('/api/upload', fd)
      set('image', data.url)
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name) return toast.error('Name is required')
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const payload = { ...form, slug, parent: form.parent || null }
      if (category) {
        await axios.put(`/api/admin/categories/${category._id}`, payload)
        toast.success('Category updated')
      } else {
        await axios.post('/api/admin/categories', payload)
        toast.success('Category created')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--white)', width: '500px', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--grey-text)' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Name *</label>
            <input style={INPUT} value={form.name} onChange={e => { set('name', e.target.value); if (!form.slug) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) }} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Slug</label>
            <input style={INPUT} value={form.slug} onChange={e => set('slug', e.target.value)} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Parent Category</label>
            <select style={INPUT} value={form.parent} onChange={e => set('parent', e.target.value)}>
              <option value="">None (Top-level)</option>
              {categories.filter(c => c._id !== category?._id).map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Description</label>
            <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={LABEL}>Category Image</label>
            {form.image && (
              <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '8px' }}>
                <Image src={form.image} alt="Category" fill style={{ objectFit: 'cover' }} sizes="80px" />
              </div>
            )}
            <label style={{ display: 'block', padding: '10px', border: '2px dashed var(--grey-mid)', textAlign: 'center', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>
              {uploading ? 'Uploading…' : form.image ? 'Change Image' : 'Upload Image'}
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={LABEL}>Display Order</label>
              <input style={INPUT} type="number" value={form.displayOrder} onChange={e => set('displayOrder', Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '9px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.82rem' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
                Active
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} style={{ ...BTN, background: 'var(--grey)', color: 'var(--charcoal)' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)' }}>
              {saving ? 'Saving…' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | category object
  const [deleting, setDeleting] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ all: 'true' })
      if (search) params.set('search', search)
      const { data } = await axios.get(`/api/admin/categories?${params}`)
      setCategories(data.categories)
    } catch { toast.error('Failed to load categories') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetch() }, [fetch])

  async function handleDelete(cat) {
    if (!confirm(`Delete "${cat.name}"?`)) return
    setDeleting(cat._id)
    try {
      await axios.delete(`/api/admin/categories/${cat._id}`)
      toast.success('Category deleted')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally { setDeleting(null) }
  }

  const s = {
    th: { fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)' },
    td: { padding: '0.9rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--grey-mid)', verticalAlign: 'middle' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Categories</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>{categories.length} total</p>
        </div>
        <button onClick={() => setModal('new')} style={{ ...BTN, background: 'var(--gold)', color: 'var(--white)', padding: '10px 20px' }}>
          + New Category
        </button>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <input type="text" placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...INPUT, width: '320px' }} />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '56px', marginBottom: '8px' }} />)}</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>No categories found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th style={s.th}>Category</th>
                <th style={s.th}>Slug</th>
                <th style={s.th}>Parent</th>
                <th style={s.th}>Order</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {cat.image && (
                        <div style={{ width: '36px', height: '36px', flexShrink: 0, position: 'relative', background: 'var(--grey)' }}>
                          <Image src={cat.image} alt={cat.name} fill style={{ objectFit: 'cover' }} sizes="36px" />
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--grey-text)' }}>{cat.slug}</td>
                  <td style={{ ...s.td, fontSize: '0.8rem', color: 'var(--grey-text)' }}>{cat.parent?.name || '—'}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{cat.displayOrder}</td>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', background: cat.isActive ? '#dcfce7' : '#fee2e2', color: cat.isActive ? '#16a34a' : '#dc2626' }}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setModal(cat)}
                        style={{ ...BTN, background: 'var(--charcoal)', color: 'var(--white)', padding: '5px 12px' }}>Edit</button>
                      <button onClick={() => handleDelete(cat)} disabled={deleting === cat._id}
                        style={{ ...BTN, background: '#fee2e2', color: '#dc2626', padding: '5px 12px' }}>
                        {deleting === cat._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <CategoryModal
          category={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetch() }}
        />
      )}
    </div>
  )
}
