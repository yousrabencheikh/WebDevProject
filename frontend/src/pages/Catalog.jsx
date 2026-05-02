import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search)    params.search    = search;
      if (category)  params.category  = category;
      if (available) params.available = available;
      const res = await api.get('/books', { params });
      setBooks(res.data.books);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, category, available]);

  useEffect(() => {
    api.get('/books/categories').then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handleFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };
  const clearAll = () => { setSearch(''); setSearchInput(''); setCategory(''); setAvailable(''); setPage(1); };
  const hasFilters = search || category || available;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Book Catalog</h1>
          {!loading && <p className="text-sm text-rose-300 mt-0.5">{total} {total === 1 ? 'book' : 'books'} found</p>}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 mb-5">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by title, author, or ISBN…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field flex-1 min-w-48"
          />
          <select value={category} onChange={handleFilter(setCategory)} className="input-field w-auto">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={available} onChange={handleFilter(setAvailable)} className="input-field w-auto">
            <option value="">All Books</option>
            <option value="true">Available Only</option>
          </select>
          <button type="submit" className="btn-primary px-5">Search</button>
          {hasFilters && (
            <button type="button" onClick={clearAll} className="btn-secondary px-4">Clear</button>
          )}
        </form>
      </div>

      {/* Category pills */}
      {categories.length > 0 && !category && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              className="text-xs px-3 py-1.5 bg-white border border-rose-100 text-rose-400 rounded-full hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-400 animate-spin" />
          <p className="text-rose-300 text-sm">Loading books…</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📭</div>
          <p className="text-gray-500 font-medium">No books found</p>
          <p className="text-rose-300 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
