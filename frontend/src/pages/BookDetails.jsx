import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

export default function BookDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isStaff = user?.role === 'librarian' || user?.role === 'admin';

  const fetchBook = async () => {
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data.book);
    } catch { navigate('/catalog'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBook(); }, [id]);

  const handleBorrow = async () => {
    setBorrowing(true); setError(''); setMessage('');
    try {
      await api.post('/loans/borrow', { book_id: parseInt(id) });
      setMessage('Book borrowed successfully! Check My Loans to manage it.');
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to borrow book');
    } finally { setBorrowing(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-400 animate-spin" />
      <p className="text-rose-300 text-sm">Loading…</p>
    </div>
  );
  if (!book) return null;

  const available = book.available_copies > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-600 mb-5 transition-colors"
      >
        ← Back to Catalog
      </button>

      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        {/* Accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-rose-300 to-pink-300" />

        <div className="p-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge bg-rose-50 text-rose-500 border border-rose-100">{book.category}</span>
            <span className={`badge ${available ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-400 border border-red-100'}`}>
              {available ? `${book.available_copies} available` : 'Unavailable'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
          <p className="text-gray-400 text-base mt-1">by {book.author}</p>

          {/* Stats grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'ISBN',    value: book.isbn },
              { label: 'Year',    value: book.year || '—' },
              { label: 'Copies',  value: book.total_copies },
              { label: 'Available', value: book.available_copies, colored: true },
            ].map(({ label, value, colored }) => (
              <div key={label} className="bg-rose-50/60 rounded-xl p-3 border border-rose-100/60">
                <p className="text-xs text-rose-400 font-medium">{label}</p>
                <p className={`font-semibold mt-0.5 ${colored ? (available ? 'text-emerald-600' : 'text-red-500') : 'text-gray-700'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {book.description && (
            <div className="mt-5 p-4 bg-rose-50/40 rounded-xl border border-rose-100/60">
              <p className="text-xs font-semibold text-rose-400 mb-1.5 uppercase tracking-wide">Description</p>
              <p className="text-gray-600 text-sm leading-relaxed">{book.description}</p>
            </div>
          )}

          {message && (
            <div className="mt-4 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm">{message}</div>
          )}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="mt-6 flex gap-3">
            {!isStaff && (
              <button onClick={handleBorrow} disabled={borrowing || !available} className="btn-primary flex-1 py-2.5">
                {borrowing ? 'Borrowing…' : !available ? 'Not Available' : 'Borrow Book'}
              </button>
            )}
            <button onClick={() => navigate('/my-loans')} className="btn-secondary flex-1 py-2.5">
              My Loans
            </button>
          </div>

          {(user?.role === 'student' || user?.role === 'faculty') && (
            <p className="text-xs text-rose-300 mt-3 text-center">
              {user.role === 'student' ? 'Students: max 5 books · 14-day loan period' : 'Faculty: max 10 books · 30-day loan period'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
