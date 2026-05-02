import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const upd = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div className="min-h-screen bg-rose-50/50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-100 rounded-2xl mb-4 shadow-sm">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-2xl font-bold text-rose-500">Create an account</h1>
          <p className="text-gray-400 text-sm mt-1">Join the Faculty Library</p>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-7">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full name',      field: 'name',     type: 'text',     placeholder: 'Your name',          minLength: 2 },
              { label: 'Email address',  field: 'email',    type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password',       field: 'password', type: 'password', placeholder: 'At least 6 characters', minLength: 6 },
            ].map(({ label, field, type, placeholder, minLength }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-rose-400 mb-1.5">{label}</label>
                <input type={type} value={form[field]} onChange={upd(field)} className="input-field" placeholder={placeholder} minLength={minLength} required />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">Role</label>
              <select value={form.role} onChange={upd('role')} className="input-field">
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
              </select>
              <p className="text-xs text-rose-300 mt-1.5">Librarian & Admin roles are assigned by administrators.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base mt-1">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-400 hover:text-rose-600 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
