import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

export default function ChatListPage() {
  const [usersList, setUsersList] = useState([]); // Ganti nama state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Mengambil daftar SEMUA user, kecuali diri sendiri
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) { // Jangan tampilkan diri sendiri
          users.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsersList(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // === INI BAGIAN PALING PENTING ===
  // Fungsi untuk membuat/mengambil chat room bersama
  const handleSelectChat = async (otherUser) => {
    if (!currentUser) return;

    // 1. Buat ID chat yang unik & konsisten
    const myId = currentUser.uid;
    const otherId = otherUser.id;
    const combinedId = myId > otherId ? `${myId}_${otherId}` : `${otherId}_${myId}`;

    try {
      // 2. Cek apakah dokumen chat ini sudah ada
      const chatDocRef = doc(db, 'chats', combinedId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        // 3. Jika belum ada, buat dokumen chat baru
        await setDoc(chatDocRef, {
          members: [myId, otherId], // Simpan siapa saja anggotanya
          createdAt: serverTimestamp(),
          lastMessage: null, // Belum ada pesan
        });
        console.log("Dokumen chat baru dibuat:", combinedId);
      } else {
        console.log("Masuk ke chat yang sudah ada:", combinedId);
      }
      
      // 4. Arahkan pengguna ke room chat bersama
      navigate(`/chat/${combinedId}`);

    } catch (error) {
      console.error("Error membuat/mengambil chat:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header (Salin dari kode statis Anda) */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Chats</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/search')} className="hover:bg-white/20 p-2 rounded-full transition">
              <Search className="w-5 h-5" />
            </button>
            <button className="hover:bg-white/20 p-2 rounded-full transition">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari chat..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white sticky top-[120px]"> {/* Sesuaikan sticky top jika perlu */}
        <button className="flex-1 py-3 font-semibold text-blue-500 border-b-2 border-blue-500 transition">
          Personal
        </button>
        <button
          onClick={() => navigate('/groups')}
          className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700 transition"
        >
          Grup
        </button>
      </div>

      {/* Chat List (Dinamis) */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <p className="p-4 text-center text-gray-500">Memuat...</p>
        ) : (
          usersList.map(user => (
            <div
              key={user.id}
              onClick={() => handleSelectChat(user)} // Panggil fungsi baru
              className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-2xl shadow-md">
                  {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                {/* TODO: Tambahkan logic status online */}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-800 truncate">{user.displayName || user.email}</h3>
                </div>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}