import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, UserPlus } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function GroupListPage() {
  const [groups, setGroups] = useState([]); // State untuk data dinamis
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Ganti ini dengan query yang benar untuk mengambil
    // daftar grup yang diikuti oleh pengguna saat ini.
    const q = query(collection(db, 'groups')); // Contoh: ambil SEMUA grup
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const groupsList = [];
      querySnapshot.forEach((doc) => {
        groupsList.push({ id: doc.id, ...doc.data() });
      });
      setGroups(groupsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Grup Chat</h1>
          <div className="flex items-center gap-3">
            <button className="hover:bg-white/20 p-2 rounded-full transition">
              <UserPlus className="w-5 h-5" />
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
            placeholder="Cari grup..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white sticky top-[...height_header...]">
        <button
          onClick={() => navigate('/chat')}
          className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700 transition"
        >
          Personal
        </button>
        <button className="flex-1 py-3 font-semibold text-purple-500 border-b-2 border-purple-500 transition">
          Grup
        </button>
      </div>

      {/* Group List (Dinamis) */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <p className="p-4 text-center text-gray-500">Memuat grup...</p>
        ) : (
          groups.map(group => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)} // Navigasi ke chat grup
              className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl shadow-md">
                {group.avatar || group.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-800 truncate">{group.name}</h3>
                  {/* <span className="text-xs text-gray-500">{group.time}</span> */}
                </div>
                {/* <p className="text-sm text-gray-600 truncate">{group.lastMessage}</p> */}
                <p className="text-xs text-gray-400">{group.members?.length || 0} anggota</p>
              </div>
              {/* {group.unread > 0 && ( ... )} */}
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}