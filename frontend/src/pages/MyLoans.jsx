import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';

const STATUS = {
  active:   { label: 'Active',   cls: 'bg-sky-50 text-sky-500 border border-sky-100' },
  returned: { label: 'Returned', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  overdue:  { label: 'Overdue',  cls: 'bg-red-50 text-red-400 border border-red-100' },
};

function fmt(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/loans/my', { params });
      setLoans(res.data.loans);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const act = async (loanId, fn, msg) => {
    setBusy((b) => ({ ...b, [loanId]: true }));
    try { await fn(); showToast(msg, 'success'); fetchLoans(); }
    catch (err) { showToast(err.response?.data?.message || 'Action failed', 'error'); }
    finally { setBusy((b) => ({ ...b, [loanId]: false })); }
  };

  const toastCls = toast.type === 'success'
    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
    : 'bg-rose-50 border-rose-100 text-rose-500';

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">My Loans</h1>
        <p className="text-sm text-rose-300 mt-0.5">{total} total</p>
      </div>

      {toast.msg && (
        <div className={`mb-4 border px-4 py-3 rounded-xl text-sm ${toastCls}`}>{toast.msg}</div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[['', 'All'], ['active', 'Active'], ['overdue', 'Overdue'], ['returned', 'Returned']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              statusFilter === val
                ? 'bg-rose-400 text-white border-rose-400 shadow-sm'
                : 'bg-white border-rose-100 text-rose-400 hover:bg-rose-50 hover:border-rose-200'
            }`}
          >
            {label}{val === '' ? ` (${total})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-400 animate-spin" />
          <p className="text-rose-300 text-sm">Loading…</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-rose-100">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📋</div>
          <p className="text-gray-500 font-medium">No loans found</p>
          <p className="text-rose-300 text-sm mt-1">Borrow a book from the catalog to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rose-100">
                  {['Book', 'Borrowed', 'Due Date', 'Renewals', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="th bg-rose-50/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {loans.map((loan) => {
                  const st = STATUS[loan.status] || STATUS.active;
                  const isOverdue = loan.status === 'overdue';
                  return (
                    <tr key={loan.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="td">
                        <p className="font-medium text-gray-700">{loan.title}</p>
                        <p className="text-rose-300 text-xs">{loan.author}</p>
                      </td>
                      <td className="td text-gray-400">{fmt(loan.borrowed_at)}</td>
                      <td className={`td ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {fmt(loan.due_date)}
                        {isOverdue && <span className="block text-xs text-red-400">Overdue</span>}
                      </td>
                      <td className="td">
                        <span className={`badge ${loan.renewals >= 2 ? 'bg-red-50 text-red-400 border border-red-100' : 'bg-rose-50 text-rose-400 border border-rose-100'}`}>
                          {loan.renewals}/2
                        </span>
                      </td>
                      <td className="td">
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="td">
                        {loan.status !== 'returned' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => act(loan.id, () => api.put(`/loans/${loan.id}/return`), 'Book returned.')}
                              disabled={busy[loan.id]}
                              className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1 rounded-lg disabled:opacity-50 font-medium transition-colors"
                            >
                              Return
                            </button>
                            {loan.renewals < 2 && loan.status === 'active' && (
                              <button
                                onClick={() => act(loan.id, () => api.put(`/loans/${loan.id}/renew`), 'Loan renewed.')}
                                disabled={busy[loan.id]}
                                className="text-xs bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100 px-2.5 py-1 rounded-lg disabled:opacity-50 font-medium transition-colors"
                              >
                                Renew
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
