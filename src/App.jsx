import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig';

// Halaman & Komponen
import AuthPage from './components/AuthPage'; // Gunakan AuthPage Anda
import HomePage from './pages/HomePage';
import ChatListPage from './pages/ChatListPage';
import GroupListPage from './pages/GroupListPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ChatRoomPage from './pages/ChatRoomPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek status login dari Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/" element={<HomePage />} />
      
      {/* Jika sudah login, /login akan diarahkan ke /chat */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/chat" /> : <AuthPage setUser={setUser} />} 
      />

      {/* Rute Terproteksi (Hanya bisa diakses setelah login) */}
      <Route element={<ProtectedRoute user={user} />}>
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:chatId" element={<ChatRoomPage />} />
        <Route path="/groups" element={<GroupListPage />} />
        <Route path="/groups/:groupId" element={<ChatRoomPage isGroup={true} />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Rute fallback jika halaman tidak ditemukan */}
      <Route path="*" element={<Navigate to={user ? "/chat" : "/"} />} />
    </Routes>
  );
}

export default App;