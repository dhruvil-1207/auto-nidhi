import { useState, useEffect, useCallback } from 'react'

import {
  Search, Filter, RefreshCw,
  FolderOpen, Calendar, User, Building2,
} from 'lucide-react'
import { filesApi } from '../../api/services'
import FileDetailDrawer from '../../components/app/FileDetailDrawer'
import PageHeader from '../../components/app/PageHeader'

const STATUS_OPTIONS = [
  { value: 'draft',         label: 'Draft'         },
  { value: 'login',         label: 'Login'         },
  { value: 'under_process', label: 'Under Process' },
  { value: 'sanctioned',    label: 'Sanctioned'    },
  { value: 'disbursed',     label: 'Disbursed'     },
  { value: 'completed',     label: 'Completed'     },
  { value: 'cancelled',     label: 'Cancelled'     },
]

const FILE_TYPE_OPTIONS = [
  { value: 'new_vehicle',  label: 'New Vehicle'  },
  { value: 'used_vehicle', label: 'Used Vehicle' },
  { value: 'renewal',      label: 'Renewal'      },
]

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  draft:         { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  login:         { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  under_process: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  sanctioned:    { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  disbursed:     { bg: '#f0fdfa', text: '#0f766e', dot: '#14b8a6' },
  completed:     { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  cancelled:     { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
}

function normalizeKey(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '_')
}

function fmtStatus(s: string) {
  return (s || '').split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

function fmtType(t: string) {
  return FILE_TYPE_OPTIONS.find(o => o.value === t)?.label || fmtStatus(t) || '—'
}

function StatusBadge({ status }: { status: string }) {
  const key = normalizeKey(status)
  const sc = STATUS_COLOR[key] || STATUS_COLOR.draft
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: sc.bg, color: sc.text,
      padding: '3px 10px', borderRadius: 99, fontSize: '.71rem', fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
      {fmtStatus(status)}
    </span>
  )
}

export default function AccountantFilesPage() {

  // List state
  const [rows, setRows]         = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [typeF, setTypeF]       = useState('')
  const [statusF, setStatusF]   = useState('')

  // Drawer
  const [drawerFileId, setDrawerFileId] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const ROWS_PER_PAGE = 5

  // ── Helpers ──────────────────────────────────────────────────────────────

  const loadFiles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await filesApi.list(page, ROWS_PER_PAGE, statusF || undefined, typeF || undefined)
      setRows(Array.isArray(res.data) ? res.data : res.data ?? [])
      setTotal(res.total || 0)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [statusF, typeF, page])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, typeF, statusF])

  useEffect(() => { loadFiles() }, [loadFiles])

  // ── Client-side search filter ─────────────────────────────────────────────

  const filtered = rows.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (r.file_number || '').toLowerCase().includes(q) ||
      (r.customer || '').toLowerCase().includes(q) ||
      (r.bank || '').toLowerCase().includes(q) ||
      (r.assigned || '').toLowerCase().includes(q)
    )
  })

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader title="Files" subtitle="All loan & insurance files (Read Only for Accountant)" />

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180, maxWidth: 300 }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="form-input"
            placeholder="Search file#, customer, bank…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, height: 36 }}
          />
        </div>

        {/* File type filter */}
        <div style={{ position: 'relative' }}>
          <Filter size={13} color="#94a3b8" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
          <select
            className="form-select"
            style={{ paddingLeft: 28, height: 36, minWidth: 150 }}
            value={typeF}
            onChange={e => setTypeF(e.target.value)}
          >
            <option value="">All Types</option>
            {FILE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Status filter */}
        <select
          className="form-select"
          style={{ height: 36, minWidth: 160 }}
          value={statusF}
          onChange={e => setStatusF(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Refresh */}
        <button
          className="btn btn-outline btn-sm"
          onClick={loadFiles}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 12px' }}
          title="Refresh"
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', color: '#be123c', fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['File #', 'Customer', 'Type', 'Status', 'Bank', 'Docket Date', 'Assigned', 'Created'].map(h => (
                <th key={h} style={{
                  padding: '11px 14px', textAlign: 'left',
                  fontSize: '.71rem', fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '.5px', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
                  Loading files…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FolderOpen size={32} color="#cbd5e1" />
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: 14 }}>No files found</div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      {search || typeF || statusF ? 'Try adjusting your filters.' : 'There are currently no files in the system.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!loading && filtered.map((r, i) => (
              <tr
                key={r.id}
                style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* File # */}
                <td style={{ padding: '11px 14px' }}>
                  <span
                    style={{
                      fontWeight: 700, fontSize: '.82rem', color: '#2563eb',
                      cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '.3px',
                    }}
                    onClick={() => setDrawerFileId(r.id)}
                    title="View detail"
                  >
                    {r.file_number || '—'}
                  </span>
                </td>

                {/* Customer */}
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={13} color="#94a3b8" />
                    <span style={{ fontSize: '.84rem', fontWeight: 500, color: '#1e293b' }}>
                      {r.customer || '—'}
                    </span>
                  </div>
                </td>

                {/* Type */}
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#64748b' }}>
                    {fmtType(normalizeKey(r.type || ''))}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: '11px 14px' }}>
                  <StatusBadge status={r.status || 'draft'} />
                </td>

                {/* Bank */}
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Building2 size={12} color="#94a3b8" />
                    <span style={{ fontSize: '.8rem', color: '#475569' }}>{r.bank || '—'}</span>
                  </div>
                </td>

                {/* Docket Date */}
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={12} color="#94a3b8" />
                    <span style={{ fontSize: '.8rem', color: '#475569' }}>{r.docket_date || '—'}</span>
                  </div>
                </td>

                {/* Assigned */}
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ fontSize: '.8rem', color: '#64748b' }}>{r.assigned || 'Unassigned'}</span>
                </td>

                {/* Created */}
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ fontSize: '.78rem', color: '#94a3b8' }}>{r.created || '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '9px 14px', borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#94a3b8' }}>
            Showing {filtered.length} of {total} file{total !== 1 ? 's' : ''}
            {(search || typeF || statusF) && ' (filtered)'}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (() => {
          const totalPages = Math.ceil(total / ROWS_PER_PAGE)
          return (
            <div style={{ padding: '10px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                Previous
              </button>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                Next
              </button>
            </div>
          )
        })()}
      </div>

      <FileDetailDrawer fileId={drawerFileId} onClose={() => setDrawerFileId(null)} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(.96) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  )
}
