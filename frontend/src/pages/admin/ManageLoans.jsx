import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import Pagination from '../../components/Pagination';

const STATUS = {
  active:   { label: 'Active',   cls: 'bg-sky-50 text-sky-500 border border-sky-100' },
  returned: { label: 'Returned', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  overdue:  { label: 'Overdue',  cls: 'bg-red-50 text-red-400 border border-red-100' },
};

function fmt(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ManageLoans() {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/loans', { params });
      setLoans(res.data.loans); setTotalPages(res.data.totalPages); setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handleReturn = async (loanId) => {
    setBusy((b) => ({ ...b, [loanId]: true }));
    try { await api.put(`/loans/${loanId}/return`); showToast('Marked as returned.'); fetchLoans(); }
    catch (err) { showToast(err.response?.data?.message || 'Failed'); }
    finally { setBusy((b) => ({ ...b, [loanId]: false })); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">All Loans</h1>
        <p className="text-sm text-rose-300 mt-0.5">{total} loans total</p>
      </div>

      {toast && (
        <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-500 px-4 py-3 rounded-xl text-sm">{toast}</div>
      )}

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
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-400 animate-spin" />
          <p className="text-rose-300 text-sm">Loading…</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-rose-100">
          <p className="text-gray-400">No loans found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rose-100">
                  {['User', 'Book', 'Borrowed', 'Due Date', 'Renewals', 'Status', 'Action'].map((h) => (
                    <th key={h} className="th bg-rose-50/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {loans.map((loan) => {
                  const st = STATUS[loan.status] || STATUS.active;
                  return (
                    <tr key={loan.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="td">
                        <p className="font-medium text-gray-700">{loan.user_name}</p>
                        <p className="text-rose-300 text-xs">{loan.user_email}</p>
                        <span className="badge bg-pink-50 text-pink-400 border border-pink-100 mt-0.5 inline-block capitalize">{loan.user_role}</span>
                      </td>
                      <td className="td">
                        <p className="font-medium text-gray-700">{loan.title}</p>
                        <p className="text-rose-300 text-xs">{loan.author}</p>
                      </td>
                      <td className="td text-gray-400">{fmt(loan.borrowed_at)}</td>
                      <td className={`td ${loan.status === 'overdue' ? 'text-red-400 font-medium' : 'text-gray-400'}`}>{fmt(loan.due_date)}</td>
                      <td className="td text-gray-400">{loan.renewals}/2</td>
                      <td className="td"><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td className="td">
                        {loan.status !== 'returned' && (
                          <button
                            onClick={() => handleReturn(loan.id)}
                            disabled={busy[loan.id]}
                            className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1 rounded-lg font-medium disabled:opacity-50"
                          >
                            Return
                          </button>
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
