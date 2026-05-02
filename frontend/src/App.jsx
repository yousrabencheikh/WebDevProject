import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import BookDetails from './pages/BookDetails';
import MyLoans from './pages/MyLoans';
import Profile from './pages/Profile';
import ManageBooks from './pages/admin/ManageBooks';
import ManageLoans from './pages/admin/ManageLoans';
import ManageUsers from './pages/admin/ManageUsers';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/catalog" replace />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="my-loans" element={<MyLoans />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="manage/books"
              element={
                <ProtectedRoute roles={['librarian', 'admin']}>
                  <ManageBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="manage/loans"
              element={
                <ProtectedRoute roles={['librarian', 'admin']}>
                  <ManageLoans />
                </ProtectedRoute>
              }
            />
            <Route
              path="manage/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
