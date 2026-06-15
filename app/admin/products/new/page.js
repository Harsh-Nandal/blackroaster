'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'
import VariantManager from '@/components/admin/VariantManager'

const INPUT = { padding: '9px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'var(--white)', boxSizing: 'border-box' }
const LABEL = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-text)', display: 'block', marginBottom: '6px' }
const SECTION = { background: 'var(--white)', border: '1px solid var(--grey-mid)', padding: '1.75rem', marginBottom: '1.5rem' }
const SECTION_TITLE = { fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--grey-mid)' }

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  )
}

async function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', 'luxwall/products')
  const { data } = await axios.post('/api/upload', fd)
  return data.url
}

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const [form, setForm] = useState({
    name: '', sku: '', slug: '', type: 'simple',
    category: '', brand: '',
    description: '', shortDescription: '',
    price: '', salePrice: '', stock: '',
    images: [], thumbnail: '',
    isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
    tags: '',
    metaTitle: '', metaDescription: '',
    specifications: [],
    attributes: [],
    variants: [],
  })

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/categories?all=true'),
      axios.get('/api/admin/brands?all=true'),
    ]).then(([cats, brds]) => {
      setCategories(cats.data.categories || [])
      setBrands(brds.data.brands || [])
    }).catch(() => {})
  }, [])

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function autoSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingImages(true)
    try {
      const urls = await Promise.all(files.map(uploadFile))
      setForm(f => ({
        ...f,
        images: [...f.images, ...urls],
        thumbnail: f.thumbnail || urls[0],
      }))
      toast.success(`${urls.length} image(s) uploaded`)
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploadingImages(false)
    }
  }

  function removeImage(url) {
    setForm(f => ({
      ...f,
      images: f.images.filter(i => i !== url),
      thumbnail: f.thumbnail === url ? (f.images.filter(i => i !== url)[0] || '') : f.thumbnail,
    }))
  }

  function addSpec() {
    setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }))
  }

  function updateSpec(i, field, val) {
    setForm(f => {
      const specs = [...f.specifications]
      specs[i] = { ...specs[i], [field]: val }
      return { ...f, specifications: specs }
    })
  }

  function removeSpec(i) {
    setForm(f => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name) return toast.error('Product name is required')
    if (!form.category) return toast.error('Category is required')

    const isVariable = form.type === 'variable'
    if (isVariable && form.variants.length === 0) return toast.error('Add at least one variant for a variable product')
    if (!isVariable && !form.price) return toast.error('Price is required')

    setSaving(true)
    try {
      const payload = {
        ...form,
        slug: form.slug || autoSlug(form.name),
        sku: form.sku || `SKU-${Date.now()}`,
        price: isVariable ? 0 : Number(form.price),
        salePrice: (!isVariable && form.salePrice) ? Number(form.salePrice) : undefined,
        stock: isVariable ? 0 : (Number(form.stock) || 0),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        specifications: form.specifications.filter(s => s.key && s.value),
        attributes: isVariable ? form.attributes : [],
        variants: isVariable ? form.variants.map(v => ({
          ...v,
          price: Number(v.price) || 0,
          salePrice: v.salePrice ? Number(v.salePrice) : undefined,
          stock: Number(v.stock) || 0,
        })) : [],
      }
      if (!form.brand) delete payload.brand

      await axios.post('/api/admin/products', payload)
      toast.success('Product created!')
      router.push('/admin/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <button type="button" onClick={() => router.back()}
            style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--grey-text)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '8px', textTransform: 'uppercase' }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>New Product</h1>
        </div>
        <button type="submit" disabled={saving}
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '12px 24px', background: saving ? 'var(--grey-mid)' : 'var(--gold)', color: 'var(--white)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main column */}
        <div>
          {/* Basic Info */}
          <div style={SECTION}>
            <div style={SECTION_TITLE}>Basic Information</div>

            {/* Product Type Toggle */}
            <Field label="Product Type">
              <div style={{ display: 'flex', gap: '0' }}>
                {['simple', 'variable'].map(t => (
                  <button key={t} type="button" onClick={() => set('type', t)}
                    style={{ flex: 1, padding: '9px', fontFamily: 'var(--font-ui)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'capitalize', border: '1px solid var(--grey-mid)', cursor: 'pointer', background: form.type === t ? 'var(--charcoal)' : 'var(--white)', color: form.type === t ? 'var(--white)' : 'var(--charcoal)', fontWeight: form.type === t ? 600 : 400 }}>
                    {t === 'simple' ? 'Simple (single SKU)' : 'Variable (multiple variants)'}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Product Name *">
              <input style={INPUT} value={form.name} onChange={e => { set('name', e.target.value); if (!form.slug) set('slug', autoSlug(e.target.value)) }} required />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="SKU">
                <input style={INPUT} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="Auto-generated if empty" />
              </Field>
              <Field label="Slug">
                <input style={INPUT} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-from-name" />
              </Field>
            </div>
            <Field label="Short Description">
              <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} />
            </Field>
            <Field label="Full Description">
              <textarea style={{ ...INPUT, minHeight: '160px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
            </Field>
          </div>

          {/* Images */}
          <div style={SECTION}>
            <div style={SECTION_TITLE}>Product Images</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
              {form.images.map(url => (
                <div key={url} style={{ position: 'relative', aspectRatio: '1', background: 'var(--grey)', border: form.thumbnail === url ? '2px solid var(--gold)' : '2px solid transparent' }}>
                  <Image src={url} alt="Product" fill style={{ objectFit: 'cover' }} sizes="120px" />
                  <button type="button" onClick={() => removeImage(url)}
                    style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '12px', lineHeight: '20px', textAlign: 'center' }}>
                    ×
                  </button>
                  {form.thumbnail !== url && (
                    <button type="button" onClick={() => set('thumbnail', url)}
                      style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px', padding: '2px' }}>
                      Set main
                    </button>
                  )}
                </div>
              ))}
            </div>
            <label style={{ display: 'block', padding: '12px', border: '2px dashed var(--grey-mid)', textAlign: 'center', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.8rem', color: 'var(--grey-text)' }}>
              {uploadingImages ? 'Uploading…' : '+ Upload Images (multiple)'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImages} />
            </label>
          </div>

          {/* Pricing & Stock — simple products only */}
          {form.type === 'simple' && (
            <div style={SECTION}>
              <div style={SECTION_TITLE}>Pricing & Stock</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <Field label="Regular Price (₹) *">
                  <input style={INPUT} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} />
                </Field>
                <Field label="Sale Price (₹)">
                  <input style={INPUT} type="number" min="0" step="0.01" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} />
                </Field>
                <Field label="Stock Quantity">
                  <input style={INPUT} type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* Attributes & Variants — variable products only */}
          {form.type === 'variable' && (
            <div style={SECTION}>
              <div style={SECTION_TITLE}>Attributes & Variants</div>
              <VariantManager
                attributes={form.attributes}
                variants={form.variants}
                onChange={(attrs, vars) => setForm(f => ({ ...f, attributes: attrs, variants: vars }))}
              />
            </div>
          )}

          {/* Specifications */}
          <div style={SECTION}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...SECTION_TITLE, marginBottom: '1rem' }}>
              <span>Specifications</span>
              <button type="button" onClick={addSpec}
                style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', letterSpacing: '0.1em', padding: '6px 14px', background: 'var(--charcoal)', color: 'var(--white)', border: 'none', cursor: 'pointer' }}>
                + Add
              </button>
            </div>
            {form.specifications.map((spec, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                <input style={INPUT} placeholder="Key (e.g. Material)" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} />
                <input style={INPUT} placeholder="Value" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
                <button type="button" onClick={() => removeSpec(i)}
                  style={{ padding: '9px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}>×</button>
              </div>
            ))}
            {form.specifications.length === 0 && (
              <p style={{ color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.78rem' }}>No specifications yet</p>
            )}
          </div>

          {/* SEO */}
          <div style={SECTION}>
            <div style={SECTION_TITLE}>SEO</div>
            <Field label="Meta Title">
              <input style={INPUT} value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} placeholder={form.name} />
            </Field>
            <Field label="Meta Description">
              <textarea style={{ ...INPUT, minHeight: '80px', resize: 'vertical' }} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={SECTION}>
            <div style={SECTION_TITLE}>Organisation</div>
            <Field label="Category *">
              <select style={INPUT} value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.parent ? `↳ ${c.name}` : c.name}</option>)}
              </select>
            </Field>
            <Field label="Brand">
              <select style={INPUT} value={form.brand} onChange={e => set('brand', e.target.value)}>
                <option value="">No brand</option>
                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Tags (comma-separated)">
              <input style={INPUT} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="modern, wood, living-room" />
            </Field>
          </div>

          <div style={SECTION}>
            <div style={SECTION_TITLE}>Status</div>
            {[
              { key: 'isActive', label: 'Active (visible on site)' },
              { key: 'isFeatured', label: 'Featured Product' },
              { key: 'isNewArrival', label: 'New Arrival' },
              { key: 'isBestSeller', label: 'Best Seller' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', color: 'var(--charcoal)' }}>
                <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }} />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  )
}
