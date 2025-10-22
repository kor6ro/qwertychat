import { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig';
import AuthPage from './components/AuthPage';
import ChatRoom from './components/ChatRoom';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek status login setiap kali aplikasi dibuka atau di-refresh
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Berhenti cek saat komponen tidak lagi ditampilkan
    return () => unsubscribe();
  }, []);

  // Tampilkan loading saat masih proses cek
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  // Jika sudah selesai cek, tentukan halaman yang ditampilkan
  return (
    <div>
      {user ? <ChatRoom user={user} /> : <AuthPage setUser={setUser} />}
    </div>
  );
}

export default App;