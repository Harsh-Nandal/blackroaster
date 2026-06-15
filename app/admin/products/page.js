'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  true: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  false: { bg: '#fee2e2', color: '#dc2626', label: 'Inactive' },
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const { data } = await axios.get(`/api/admin/products?${params}`)
      setProducts(data.data)
      setPagination(data.pagination)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await axios.delete(`/api/admin/products/${id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  async function toggleActive(product) {
    try {
      await axios.put(`/api/admin/products/${product._id}`, { isActive: !product.isActive })
      toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`)
      fetchProducts()
    } catch {
      toast.error('Update failed')
    }
  }

  const s = { /* shared styles */
    th: { fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)', whiteSpace: 'nowrap' },
    td: { padding: '1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--grey-mid)', verticalAlign: 'middle' },
    btn: { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Products</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>
            {pagination.total} total products
          </p>
        </div>
        <Link href="/admin/products/new" style={{ ...s.btn, background: 'var(--gold)', color: 'var(--white)' }}>
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--white)', padding: '1rem 1.5rem', border: '1px solid var(--grey-mid)' }}>
        <input
          type="text"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', outline: 'none' }}
        />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', background: 'var(--white)', cursor: 'pointer' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>
            No products found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ivory)' }}>
                  <th style={s.th}>Product</th>
                  <th style={s.th}>SKU</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Price</th>
                  <th style={s.th}>Stock</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const badge = STATUS_BADGE[p.isActive]
                  return (
                    <tr key={p._id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', flexShrink: 0, background: 'var(--grey)', overflow: 'hidden', position: 'relative', border: '1px solid var(--grey-mid)' }}>
                            {(p.thumbnail || p.images?.[0]) && (
                              <Image src={p.thumbnail || p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="44px" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--charcoal)', fontSize: '0.85rem', marginBottom: '2px' }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)' }}>{p.type}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--grey-text)' }}>{p.sku}</td>
                      <td style={{ ...s.td, fontSize: '0.8rem' }}>{p.category?.name || '—'}</td>
                      <td style={s.td}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                          {p.salePrice ? (
                            <>
                              <span style={{ color: 'var(--charcoal)' }}>₹{p.salePrice?.toLocaleString('en-IN')}</span>
                              <span style={{ textDecoration: 'line-through', color: 'var(--grey-text)', fontSize: '0.78rem', marginLeft: '6px' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                            </>
                          ) : (
                            <span>₹{p.price?.toLocaleString('en-IN') || '—'}</span>
                          )}
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{ color: p.stock === 0 ? '#dc2626' : p.stock <= 5 ? '#d97706' : 'var(--charcoal)', fontWeight: p.stock === 0 ? 600 : 400 }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button
                          onClick={() => toggleActive(p)}
                          style={{ ...s.btn, background: badge.bg, color: badge.color, padding: '4px 10px' }}
                        >
                          {badge.label}
                        </button>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/admin/products/${p._id}/edit`} style={{ ...s.btn, background: 'var(--charcoal)', color: 'var(--white)', padding: '5px 12px' }}>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            disabled={deleting === p._id}
                            style={{ ...s.btn, background: '#fee2e2', color: '#dc2626', padding: '5px 12px' }}
                          >
                            {deleting === p._id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ ...s.btn, background: page === 1 ? 'var(--grey)' : 'var(--charcoal)', color: page === 1 ? 'var(--grey-text)' : 'var(--white)' }}>
            ← Prev
          </button>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ ...s.btn, background: page === pagination.pages ? 'var(--grey)' : 'var(--charcoal)', color: page === pagination.pages ? 'var(--grey-text)' : 'var(--white)' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
