export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const base = 'min-w-[36px] h-9 px-3 text-sm rounded-xl border transition-all duration-150 font-medium';
  const normal   = `${base} bg-white border-rose-100 text-rose-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600`;
  const active   = `${base} bg-rose-400 border-rose-400 text-white shadow-sm`;
  const disabled = `${base} bg-white border-rose-50 text-rose-200 cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className={page === 1 ? disabled : normal}>
        ←
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={normal}>1</button>
          {start > 2 && <span className="text-rose-300 text-sm px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)} className={p === page ? active : normal}>{p}</button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-rose-300 text-sm px-1">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={normal}>{totalPages}</button>
        </>
      )}

      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className={page === totalPages ? disabled : normal}>
        →
      </button>
    </div>
  );
}
