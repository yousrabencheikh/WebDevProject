import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import Pagination from '../../components/Pagination';

const EMPTY = { title: '', author: '', isbn: '', category: '', year: '', total_copies: 1, description: '' };

function BookModal({ book, onClose, onSave }) {
  const [form, setForm] = useState(book ? { ...book, year: book.year || '', description: book.description || '' } : EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!book;
  const upd = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { ...form, year: form.year ? parseInt(form.year) : null, total_copies: parseInt(form.total_copies) };
      if (isEdit) await api.put(`/books/${book.id}`, payload);
      else await api.post('/books', payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-rose-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100">
          <h2 className="font-semibold text-rose-500">{isEdit ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="text-rose-300 hover:text-rose-500 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 text-red-500 px-3 py-2 rounded-xl text-sm">{error}</div>}

          {[
            { label: 'Title',    field: 'title',    required: true },
            { label: 'Author',   field: 'author',   required: true },
            { label: 'ISBN',     field: 'isbn',     required: true },
            { label: 'Category', field: 'category', required: true },
          ].map(({ label, field, required }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">{label}</label>
              <input type="text" value={form[field]} onChange={upd(field)} className="input-field" required={required} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">Year</label>
              <input type="number" value={form.year} onChange={upd('year')} min="1000" max="2099" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rose-400 mb-1.5">Copies</label>
              <input type="number" value={form.total_copies} onChange={upd('total_copies')} min="0" className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-rose-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={upd('description')} rows={3} className="input-field resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
              {loading ? 'Saving…' : isEdit ? 'Update Book' : 'Add Book'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get('/books', { params });
      setBooks(res.data.books); setTotalPages(res.data.totalPages); setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSave = () => { setModal(null); showToast('Book saved.'); fetchBooks(); };

  const handleDelete = async () => {
    try {
      await api.delete(`/books/${deleteId}`);
      setDeleteId(null); showToast('Book deleted.'); fetchBooks();
    } catch (err) { setDeleteId(null); showToast(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Books</h1>
          <p className="text-sm text-rose-300 mt-0.5">{total} books total</p>
        </div>
        <button onClick={() => setModal({ type: 'add' })} className="btn-primary">+ Add Book</button>
      </div>

      {toast && (
        <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-500 px-4 py-3 rounded-xl text-sm">{toast}</div>
      )}

      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-3">
          <input type="text" placeholder="Search books…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input-field flex-1" />
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>
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
                  {['Book', 'ISBN', 'Category', 'Total', 'Available', 'Actions'].map((h) => (
                    <th key={h} className="th bg-rose-50/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="td">
                      <p className="font-medium text-gray-700">{book.title}</p>
                      <p className="text-rose-300 text-xs">{book.author}{book.year ? ` · ${book.year}` : ''}</p>
                    </td>
                    <td className="td text-gray-400 text-xs">{book.isbn}</td>
                    <td className="td">
                      <span className="badge bg-rose-50 text-rose-500 border border-rose-100">{book.category}</span>
                    </td>
                    <td className="td text-gray-500">{book.total_copies}</td>
                    <td className="td">
                      <span className={`font-semibold ${book.available_copies > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {book.available_copies}
                      </span>
                    </td>
                    <td className="td">
                      <div className="flex gap-1.5">
                        <button onClick={() => setModal({ type: 'edit', book })} className="text-xs bg-amber-50 text-amber-500 hover:bg-amber-100 border border-amber-100 px-2.5 py-1 rounded-lg font-medium">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(book.id)} className="text-xs bg-red-50 text-red-400 hover:bg-red-100 border border-red-100 px-2.5 py-1 rounded-lg font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {modal && <BookModal book={modal.type === 'edit' ? modal.book : null} onClose={() => setModal(null)} onSave={handleSave} />}

      {deleteId && (
        <div className="fixed inset-0 bg-rose-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🗑️</div>
            <h3 className="font-semibold text-gray-700 text-center mb-1">Delete this book?</h3>
            <p className="text-gray-400 text-sm text-center mb-5">Cannot be undone. Books with active loans cannot be deleted.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 bg-red-400 hover:bg-red-500 text-white py-2 rounded-xl text-sm font-medium">Delete</button>
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
