import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-100 rounded-2xl mb-4 shadow-sm">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-2xl font-bold text-rose-500">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Faculty Library Management System</p>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-7">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base mt-1">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-rose-400 hover:text-rose-600 font-medium transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-white rounded-xl border border-rose-100 p-4 text-xs text-gray-400 shadow-sm">
          <p className="font-semibold text-rose-400 mb-2">Demo accounts</p>
          <div className="space-y-1">
            <p>admin@flms.com · Admin@123</p>
            <p>librarian@flms.com · Lib@123</p>
            <p>student@flms.com · User@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
