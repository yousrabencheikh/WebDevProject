import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const available = book.available_copies > 0;

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Color strip */}
      <div className="h-1 bg-gradient-to-r from-rose-300 to-pink-300" />

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <span className="badge bg-rose-50 text-rose-500 border border-rose-100">
            {book.category}
          </span>
          <span className={`badge ${available ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-400 border border-red-100'}`}>
            {available ? `${book.available_copies} left` : 'None left'}
          </span>
        </div>

        <h3 className="font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-rose-500 transition-colors duration-150">
          {book.title}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{book.author}</p>
        <p className="text-xs text-rose-300 mt-1">{book.year ? `${book.year} · ` : ''}ISBN {book.isbn}</p>

        <div className="mt-auto pt-4">
          <Link
            to={`/books/${book.id}`}
            className="block text-center text-sm btn-primary py-1.5"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
