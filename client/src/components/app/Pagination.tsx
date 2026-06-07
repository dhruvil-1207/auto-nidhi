import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Props {
  total: number
  page: number
  pageSize: number
  onPage: (p: number) => void
  onPageSize: (s: number) => void
  pageSizeOptions?: number[]
}

export default function Pagination({
  total, page, pageSize, onPage, onPageSize,
  pageSizeOptions = [5, 10, 20],
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, total)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | '...')[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="pagination-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="pagination-info">
          Showing {start}–{end} of {total} records
        </span>
        <select
          className="page-size-select"
          value={pageSize}
          onChange={e => { onPageSize(Number(e.target.value)); onPage(1) }}
        >
          {pageSizeOptions.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>
      <div className="pagination-controls">
        <button className="page-btn" onClick={() => onPage(1)} disabled={page === 1}>
          <ChevronsLeft size={14} />
        </button>
        <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>
          <ChevronLeft size={14} />
        </button>
        {pageNumbers.map((p, i) =>
          p === '...'
            ? <span key={`d${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)', fontSize: '.84rem' }}>…</span>
            : <button
                key={p}
                className={`page-btn${page === p ? ' active' : ''}`}
                onClick={() => onPage(p as number)}
              >{p}</button>
        )}
        <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === totalPages}>
          <ChevronRight size={14} />
        </button>
        <button className="page-btn" onClick={() => onPage(totalPages)} disabled={page === totalPages}>
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  )
}
