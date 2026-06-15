'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

const BTN = { fontFamily: 'var(--font-ui)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', border: 'none', cursor: 'pointer' }

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const { data } = await axios.get(`/api/admin/customers?${params}`)
      setCustomers(data.data)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load customers') }
    finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  async function toggleActive(customer) {
    try {
      await axios.put(`/api/admin/customers/${customer._id}`, { isActive: !customer.isActive })
      toast.success(customer.isActive ? 'Customer deactivated' : 'Customer activated')
      fetchCustomers()
    } catch { toast.error('Update failed') }
  }

  const s = {
    th: { fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--grey-text)', padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--grey-mid)' },
    td: { padding: '0.9rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--grey-mid)', verticalAlign: 'middle' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400 }}>Customers</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)', marginTop: '4px' }}>{pagination.total} registered users</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--white)', padding: '1rem 1.5rem', border: '1px solid var(--grey-mid)' }}>
        <input type="text" placeholder="Search by name, email or phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', outline: 'none' }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding: '8px 12px', border: '1px solid var(--grey-mid)', fontFamily: 'var(--font-ui)', fontSize: '0.82rem', background: 'var(--white)', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--grey-mid)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '8px' }} />)}</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--grey-text)', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>No customers found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--ivory)' }}>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Phone</th>
                <th style={s.th}>Orders</th>
                <th style={s.th}>Total Spent</th>
                <th style={s.th}>Joined</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id} onMouseEnter={e => e.currentTarget.style.background = 'var(--ivory)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--grey-text)' }}>{c.email}</div>
                  </td>
                  <td style={{ ...s.td, color: 'var(--grey-text)' }}>{c.phone || '—'}</td>
                  <td style={{ ...s.td, textAlign: 'center', fontWeight: 600 }}>{c.orderCount || 0}</td>
                  <td style={{ ...s.td }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>₹{(c.totalSpent || 0).toLocaleString('en-IN')}</span>
                  </td>
                  <td style={{ ...s.td, fontSize: '0.78rem', color: 'var(--grey-text)' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', background: c.isActive ? '#dcfce7' : '#fee2e2', color: c.isActive ? '#16a34a' : '#dc2626' }}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/admin/customers/${c._id}`}
                        style={{ ...BTN, background: 'var(--charcoal)', color: 'var(--white)', textDecoration: 'none' }}>View</Link>
                      <button onClick={() => toggleActive(c)}
                        style={{ ...BTN, background: c.isActive ? '#fef9c3' : '#dcfce7', color: c.isActive ? '#ca8a04' : '#16a34a' }}>
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ ...BTN, background: page === 1 ? 'var(--grey)' : 'var(--charcoal)', color: page === 1 ? 'var(--grey-text)' : 'var(--white)', padding: '8px 16px' }}>
            ← Prev
          </button>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.78rem', color: 'var(--grey-text)' }}>Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            style={{ ...BTN, background: page === pagination.pages ? 'var(--grey)' : 'var(--charcoal)', color: page === pagination.pages ? 'var(--grey-text)' : 'var(--white)', padding: '8px 16px' }}>
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
