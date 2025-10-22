import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Bell, LogOut, Edit2, Camera } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Jika tidak ada user, tendang ke login
      return;
    }

    // Ambil data profil user secara real-time
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentUser(docSnap.data());
      } else {
        // Handle jika data user tidak ada
        setCurrentUser({ email: user.email, displayName: "Pengguna Baru" });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login'); // Arahkan ke login setelah logout
    });
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)} // Tombol kembali
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Profil</h1>
          <button className="hover:bg-white/20 p-2 rounded-full transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Avatar Section */}
        <div className="bg-gradient-to-b from-indigo-500 to-transparent pb-20 -mb-16">
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-6xl shadow-2xl border-4 border-white">
                {/* TODO: Avatar dinamis */}
                {currentUser?.displayName?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-white text-indigo-500 p-3 rounded-full shadow-lg hover:bg-indigo-50 transition">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">{currentUser?.displayName}</h2>
            <p className="text-white/80">{currentUser?.status || "online"}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="px-4 space-y-4">
          {/* Bio Card */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Bio</h3>
              <button className="text-indigo-500 hover:text-indigo-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600">{currentUser?.bio || "Halo! Saya senang menggunakan QwertyChat"}</p>
          </div>
          
          {/* Contact Info Card */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Informasi Kontak</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-gray-800">{currentUser?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Telepon</p>
                <p className="text-gray-800">{currentUser?.phone || "+62 812-3456-7890"}</p>
              </div>
            </div>
          </div>
          
          {/* Settings Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Bell className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="font-medium text-gray-700">Notifikasi</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition border-t">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Settings className="w-5 h-5 text-purple-500" />
                </div>
                <span className="font-medium text-gray-700">Pengaturan</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition border-t"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-medium text-red-600">Keluar</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          </div>
          
          {/* App Info */}
          <div className="text-center py-6 text-gray-400 text-sm">
            <p>QwertyChat v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}