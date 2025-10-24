// src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig';

// Halaman & Komponen
import AuthPage from './components/AuthPage';
import HomePage from './pages/HomePage';
import ChatListPage from './pages/ChatListPage';
// import GroupListPage from './pages/GroupListPage'; // HAPUS INI
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ChatRoomPage from './pages/ChatRoomPage';
import ProtectedRoute from './components/ProtectedRoute';

// TAMBAHKAN HALAMAN BARU
import CallPage from './pages/CallPage';
import SettingsPage from './pages/SettingsPage';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <Route 
        path="/login" 
        element={user ? <Navigate to="/chat" /> : <AuthPage setUser={setUser} />} 
      />

      {/* Rute Terproteksi */}
      <Route element={<ProtectedRoute user={user} />}>
        <Route path="/chat" element={<ChatListPage />} />
        
        {/* Beri penanda 'isGroup' agar ChatRoomPage tahu */}
        <Route path="/chat/:chatId" element={<ChatRoomPage isGroup={false} />} />

        <Route path="/groups/:groupId" element={<ChatRoomPage isGroup={true} />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Rute fallback */}
      <Route path="*" element={<Navigate to={user ? "/chat" : "/"} />} />
    </Routes>
  );
}

export default App;