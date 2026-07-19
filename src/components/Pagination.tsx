interface PaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onChange: (page: number) => void
}

function pageNumbers(page: number, totalPages: number): (number | '…')[] {
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }
  return pages
}

export default function Pagination({ page, pageSize, totalItems, onChange }: PaginationProps) {
  if (totalItems === 0) return null
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-slate-400">
        Showing {start}–{end} of {totalItems}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
          </button>
          {pageNumbers(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-300">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  p === page ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => onChange(page + 1)}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          </button>
        </div>
      )}
    </div>
  )
}
