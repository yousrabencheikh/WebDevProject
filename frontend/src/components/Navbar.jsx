import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_COLORS = {
  admin:     'bg-violet-100 text-violet-600',
  librarian: 'bg-rose-100 text-rose-600',
  faculty:   'bg-sky-100 text-sky-600',
  student:   'bg-pink-100 text-pink-600',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname.startsWith(path);
  const isStaff = user?.role === 'librarian' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const linkCls = (path) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive(path)
        ? 'bg-rose-100 text-rose-600'
        : 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'
    }`;

  return (
    <nav className="bg-white border-b border-rose-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/catalog" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center text-lg">
              📚
            </div>
            <span className="text-rose-500 font-bold text-base tracking-wide">FLMS</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            <Link to="/catalog"  className={linkCls('/catalog')}>Catalog</Link>
            <Link to="/my-loans" className={linkCls('/my-loans')}>My Loans</Link>
            {isStaff && (
              <>
                <Link to="/manage/books" className={linkCls('/manage/books')}>Manage Books</Link>
                <Link to="/manage/loans" className={linkCls('/manage/loans')}>All Loans</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/manage/users" className={linkCls('/manage/users')}>Users</Link>
            )}
          </div>

          {/* User area */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 font-bold text-sm group-hover:bg-rose-200 transition-colors">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="leading-none">
                <p className="text-sm font-medium text-gray-700 group-hover:text-rose-500 transition-colors">{user?.name}</p>
                <span className={`badge mt-0.5 inline-block ${ROLE_COLORS[user?.role]}`}>{user?.role}</span>
              </div>
            </Link>
            <div className="w-px h-5 bg-rose-100" />
            <button
              onClick={handleLogout}
              className="text-sm text-rose-400 hover:text-rose-600 font-medium transition-colors px-2 py-1 hover:bg-rose-50 rounded-lg"
            >
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white px-4 py-3 space-y-0.5">
          {[
            { to: '/catalog',       label: 'Catalog' },
            { to: '/my-loans',      label: 'My Loans' },
            ...(isStaff ? [{ to: '/manage/books', label: 'Manage Books' }, { to: '/manage/loans', label: 'All Loans' }] : []),
            ...(isAdmin  ? [{ to: '/manage/users', label: 'Users' }]        : []),
            { to: '/profile',       label: 'Profile' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm ${isActive(to) ? 'bg-rose-100 text-rose-600 font-medium' : 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 text-rose-400 hover:text-rose-600 text-sm rounded-lg hover:bg-rose-50"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
