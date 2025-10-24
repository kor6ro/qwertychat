// src/pages/SearchPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, UserPlus } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Fungsi untuk menjalankan pencarian
  const handleSearch = async (queryText) => {
    if (queryText.trim() === '' || !currentUser) {
      setFilteredUsers([]);
      return;
    }
    
    setLoading(true);
    
    // Cari users (kecuali diri sendiri)
    const usersQuery = query(
      collection(db, 'users'), 
      where('displayName', '>=', queryText), 
      where('displayName', '<=', queryText + '\uf8ff')
    );
    
    const userSnap = await getDocs(usersQuery);
    const usersList = userSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.id !== currentUser.uid); // Filter diri sendiri
      
    setFilteredUsers(usersList);
    setLoading(false);
  };

  // Debounce search (tidak berubah)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);


  // === INI LOGIKA PENTING DARI CHATLISTPAGE ===
  // Fungsi untuk membuat/mengambil chat room bersama
  const handleSelectUser = async (otherUser) => {
    if (!currentUser) return;

    const myId = currentUser.uid;
    const otherId = otherUser.id;
    // Buat ID chat yang unik & konsisten
    const combinedId = myId > otherId ? `${myId}_${otherId}` : `${otherId}_${myId}`;

    try {
      const chatDocRef = doc(db, 'chats', combinedId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        // Jika belum ada, buat dokumen chat baru
        await setDoc(chatDocRef, {
          members: [myId, otherId],
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageAt: serverTimestamp(), // Penting untuk sorting
        });
      }
      
      // Arahkan pengguna ke room chat bersama
      navigate(`/chat/${combinedId}`);

    } catch (error) {
      console.error("Error membuat/mengambil chat:", error);
    }
  };


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Cari Kontak Baru</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <p className="p-4 text-center text-gray-500">Mencari...</p>
        ) : (
          <>
            {/* Users Section */}
            {filteredUsers.length > 0 && (
              <div>
                <h3 className="px-4 py-2 bg-gray-100 text-sm font-semibold text-gray-600">
                  Pengguna ({filteredUsers.length})
                </h3>
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    // GANTI ONCLICK KE FUNGSI BARU
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center justify-between p-4 border-b hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xl">
                        {user.displayName?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{user.displayName || user.email}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <UserPlus className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
            
            {/* TODO: Tambahkan pencarian grup publik jika perlu */}

            {/* No Results */}
            {searchQuery.trim() !== '' && !loading && filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                <Search className="w-16 h-16 mb-4" />
                <p>Tidak ada pengguna ditemukan untuk "{searchQuery}"</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}