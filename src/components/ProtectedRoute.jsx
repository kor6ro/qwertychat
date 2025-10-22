import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ user }) {
  if (!user) {
    // Jika tidak ada user, redirect ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika ada user, tampilkan halaman yang diminta (via Outlet)
  return <Outlet />;
}