import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import Pagination from '../../components/Pagination';

const ROLE_BADGE = {
  admin:     'bg-violet-50 text-violet-500 border border-violet-100',
  librarian: 'bg-rose-50 text-rose-500 border border-rose-100',
  faculty:   'bg-sky-50 text-sky-500 border border-sky-100',
  student:   'bg-pink-50 text-pink-400 border border-pink-100',
};

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState({});
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.get('/users', { params });
      setUsers(res.data.users); setTotalPages(res.data.totalPages); setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setBusy((b) => ({ ...b, [userId]: true }));
    try { await api.put(`/users/${userId}/role`, { role: newRole }); showToast('Role updated.'); fetchUsers(); }
    catch (err) { showToast(err.response?.data?.message || 'Failed'); }
    finally { setBusy((b) => ({ ...b, [userId]: false })); }
  };

  const handleToggleStatus = async (userId, isActive) => {
    setBusy((b) => ({ ...b, [userId]: true }));
    try { await api.put(`/users/${userId}/toggle-status`); showToast(isActive ? 'User deactivated.' : 'User activated.'); fetchUsers(); }
    catch (err) { showToast(err.response?.data?.message || 'Failed'); }
    finally { setBusy((b) => ({ ...b, [userId]: false })); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Manage Users</h1>
        <p className="text-sm text-rose-300 mt-0.5">{total} users total</p>
      </div>

      {toast && (
        <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-500 px-4 py-3 rounded-xl text-sm">{toast}</div>
      )}

      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2 flex-1 min-w-48">
          <input type="text" placeholder="Search by name or email…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input-field flex-1" />
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-400 animate-spin" />
          <p className="text-rose-300 text-sm">Loading…</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rose-100">
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="th bg-rose-50/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-400 font-semibold text-xs flex-shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              {u.name}
                              {isSelf && <span className="ml-1.5 text-xs text-rose-300 font-normal">(you)</span>}
                            </p>
                            <p className="text-rose-300 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="td">
                        {isSelf ? (
                          <span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={busy[u.id]}
                            className="text-xs border border-rose-200 rounded-lg px-2 py-1 bg-white text-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-300 disabled:opacity-50"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="librarian">Librarian</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="td">
                        <span className={`badge ${u.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-400 border border-rose-100'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="td text-gray-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="td">
                        {!isSelf && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.is_active)}
                            disabled={busy[u.id]}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium border disabled:opacity-50 transition-colors ${
                              u.is_active
                                ? 'bg-red-50 text-red-400 hover:bg-red-100 border-red-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
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
