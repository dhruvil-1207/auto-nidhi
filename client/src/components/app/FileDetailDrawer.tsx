import { useEffect, useState, useRef } from 'react'
import {
  X, FileText, User, CreditCard, ShieldCheck, Car,
  TrendingUp, TrendingDown, Calendar, UserCheck, Loader2,
} from 'lucide-react'
import { filesApi } from '../../api/services'

interface FileDetail {
  id: string
  file_number: string
  file_type: string
  status: string
  docket_date: string | null
  remarks: string | null
  created_at: string | null
  updated_at: string | null
  customer: {
    id: string | null
    name: string
    mobile: string
    email: string
    type: string
  }
  assigned_to: string
  created_by: string
  finance: {
    lan_number: string | null
    loan_amount: number
    emi_amount: number
    no_of_months: number | null
    irr_percentage: number
    bank: string | null
  } | null
  insurance: {
    policy_number: string | null
    valid_from: string | null
    valid_to: string | null
    premium_amount: number
    idv_amount: number
    company: string | null
    type: string | null
  } | null
  payment_in_count: number
  payment_out_count: number
  rto_count: number
  insurance_payment_count: number
}

function fmtINR(n: number) {
  if (!n) return '₹0'
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  draft:        { bg: '#f1f5f9', color: '#64748b' },
  login:        { bg: '#fef9c3', color: '#854d0e' },
  under_process:{ bg: '#dbeafe', color: '#1e40af' },
  sanctioned:   { bg: '#ede9fe', color: '#5b21b6' },
  disbursed:    { bg: '#dcfce7', color: '#166534' },
  completed:    { bg: '#dcfce7', color: '#15803d' },
  cancelled:    { bg: '#fee2e2', color: '#991b1b' },
}

interface Props {
  fileId: string | null
  onClose: () => void
}

export default function FileDetailDrawer({ fileId, onClose }: Props) {
  const [file, setFile] = useState<FileDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fileId) {
      setFile(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    filesApi.detail(fileId)
      .then((data) => { if (!cancelled) setFile(data) })
      .catch((e: any) => { if (!cancelled) setError(e?.response?.data?.detail || 'Failed to load file details') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fileId])

  // Keyboard trap — Escape closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (fileId) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fileId, onClose])

  if (!fileId) return null

  const statusStyle = file ? (STATUS_COLORS[file.status?.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b' }) : null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="File Detail"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
          width: 'min(480px, 96vw)',
          background: '#fff',
          boxShadow: '-4px 0 32px rgba(0,0,0,.16)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'hidden',
          animation: 'slideInRight .22s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 20px', borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc', flexShrink: 0,
        }}>
          <FileText size={20} color="#6366f1" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              {file ? file.file_number : 'File Details'}
            </div>
            {file && (
              <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 1 }}>
                {file.file_type?.replace(/_/g, ' ')} · Created {fmtDate(file.created_at)}
              </div>
            )}
          </div>
          {file && statusStyle && (
            <span style={{
              padding: '3px 10px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700,
              background: statusStyle.bg, color: statusStyle.color,
            }}>
              {file.status?.replace(/_/g, ' ')}
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, borderRadius: 8, color: '#64748b',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#94a3b8', gap: 10 }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
              Loading file details…
            </div>
          )}

          {error && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {file && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Customer Card */}
              <Section icon={<User size={15} />} title="Customer" color="#6366f1">
                <Row label="Name" value={file.customer.name} />
                <Row label="Mobile" value={file.customer.mobile} />
                <Row label="Email" value={file.customer.email} />
                <Row label="Type" value={file.customer.type} capitalize />
              </Section>

              {/* File Info */}
              <Section icon={<FileText size={15} />} title="File Info" color="#0ea5e9">
                <Row label="File Number" value={file.file_number} mono />
                <Row label="File Type" value={file.file_type?.replace(/_/g, ' ')} capitalize />
                <Row label="Status" value={file.status?.replace(/_/g, ' ')} capitalize />
                <Row label="Docket Date" value={fmtDate(file.docket_date)} />
                <Row label="Assigned To" value={file.assigned_to} />
                <Row label="Created By" value={file.created_by} />
                {file.remarks && <Row label="Remarks" value={file.remarks} />}
              </Section>

              {/* Finance / Loan */}
              {file.finance && (
                <Section icon={<CreditCard size={15} />} title="Loan / Finance" color="#8b5cf6">
                  <Row label="Bank" value={file.finance.bank || '—'} />
                  <Row label="LAN Number" value={file.finance.lan_number || '—'} mono />
                  <Row label="Loan Amount" value={fmtINR(file.finance.loan_amount)} />
                  <Row label="EMI Amount" value={fmtINR(file.finance.emi_amount)} />
                  <Row label="Tenure" value={file.finance.no_of_months ? `${file.finance.no_of_months} months` : '—'} />
                  <Row label="IRR" value={file.finance.irr_percentage ? `${file.finance.irr_percentage}%` : '—'} />
                </Section>
              )}

              {/* Insurance */}
              {file.insurance && (
                <Section icon={<ShieldCheck size={15} />} title="Insurance" color="#06b6d4">
                  <Row label="Company" value={file.insurance.company || '—'} />
                  <Row label="Type" value={file.insurance.type || '—'} />
                  <Row label="Policy No." value={file.insurance.policy_number || '—'} mono />
                  <Row label="Valid From" value={fmtDate(file.insurance.valid_from)} />
                  <Row label="Valid To" value={fmtDate(file.insurance.valid_to)} />
                  <Row label="Premium" value={fmtINR(file.insurance.premium_amount)} />
                  <Row label="IDV" value={fmtINR(file.insurance.idv_amount)} />
                </Section>
              )}

              {/* Payment Summary */}
              <Section icon={<TrendingUp size={15} />} title="Payment Summary" color="#22c55e">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Payment IN', count: file.payment_in_count, color: '#22c55e', icon: <TrendingUp size={14} /> },
                    { label: 'Payment OUT', count: file.payment_out_count, color: '#f43f5e', icon: <TrendingDown size={14} /> },
                    { label: 'RTO', count: file.rto_count, color: '#f59e0b', icon: <Car size={14} /> },
                    { label: 'Insurance', count: file.insurance_payment_count, color: '#06b6d4', icon: <ShieldCheck size={14} /> },
                  ].map(({ label, count, color, icon }) => (
                    <div key={label} style={{
                      background: color + '10', border: `1px solid ${color}30`,
                      borderRadius: 10, padding: '10px 14px',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ color }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: '.7rem', color: '#94a3b8', fontWeight: 500 }}>{label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

function Section({ icon, title, color, children }: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode
}) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', background: color + '0d',
        borderBottom: `1px solid ${color}25`,
      }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a' }}>{title}</span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, mono, capitalize }: {
  label: string; value: string | number | null | undefined; mono?: boolean; capitalize?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: '.78rem', color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: '.82rem', color: '#334155', fontWeight: 600,
        fontFamily: mono ? 'monospace' : undefined,
        textTransform: capitalize ? 'capitalize' : undefined,
        textAlign: 'right',
      }}>
        {value ?? '—'}
      </span>
    </div>
  )
}
