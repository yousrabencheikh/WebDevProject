import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const ROLE_META = {
  admin:     { badge: 'bg-violet-50 text-violet-500 border border-violet-100', label: 'Administrator', info: 'Full system access' },
  librarian: { badge: 'bg-rose-50 text-rose-500 border border-rose-100',       label: 'Librarian',     info: 'Manage books & loans' },
  faculty:   { badge: 'bg-sky-50 text-sky-500 border border-sky-100',          label: 'Faculty',       info: 'Max 10 books · 30-day period' },
  student:   { badge: 'bg-pink-50 text-pink-400 border border-pink-100',       label: 'Student',       info: 'Max 5 books · 14-day period' },
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const meta = ROLE_META[user?.role] || ROLE_META.student;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (form.password && form.password !== form.confirmPassword) return setError('Passwords do not match');
    const payload = {};
    if (form.name !== user.name) payload.name = form.name;
    if (form.password) payload.password = form.password;
    if (!Object.keys(payload).length) return setError('No changes to save');
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.user);
      setMessage('Profile updated successfully.');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="page-title mb-6">Profile</h1>

      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-rose-300 to-pink-300" />

        <div className="p-6">
          {/* User card */}
          <div className="flex items-center gap-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 mb-6">
            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-400 text-xl font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-gray-400 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`badge ${meta.badge}`}>{meta.label}</span>
                <span className="text-xs text-rose-300">{meta.info}</span>
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" minLength={2} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">New password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current" className="input-field" minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">Confirm password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
