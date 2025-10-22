import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fungsi untuk menjalankan pencarian
  const handleSearch = async (queryText) => {
    if (queryText.trim() === '') {
      setFilteredUsers([]);
      setFilteredGroups([]);
      return;
    }
    
    setLoading(true);
    
    // TODO: Implementasikan pencarian yang lebih baik (misal: Algolia, atau query yang lebih kompleks)
    // Query ini sederhana dan mungkin tidak efisien
    
    // Cari users
    const usersQuery = query(collection(db, 'users'), where('displayName', '>=', queryText), where('displayName', '<=', queryText + '\uf8ff'));
    const userSnap = await getDocs(usersQuery);
    const usersList = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFilteredUsers(usersList);
    
    // Cari groups
    const groupsQuery = query(collection(db, 'groups'), where('name', '>=', queryText), where('name', '<=', queryText + '\uf8ff'));
    const groupSnap = await getDocs(groupsQuery);
    const groupsList = groupSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFilteredGroups(groupsList);
    
    setLoading(false);
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 shadow-lg sticky top-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)} // Tombol kembali
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Cari</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kontak atau grup..."
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
                  Kontak ({filteredUsers.length})
                </h3>
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => navigate(`/chat/${user.id}`)} // Navigasi ke chat
                    className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xl">
                      {user.displayName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{user.displayName}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Groups Section */}
            {filteredGroups.length > 0 && (
               <div>
                <h3 className="px-4 py-2 bg-gray-100 text-sm font-semibold text-gray-600">
                  Grup ({filteredGroups.length})
                </h3>
                {filteredGroups.map(group => (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)} // Navigasi ke grup
                    className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
                      {group.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{group.name}</h4>
                      <p className="text-sm text-gray-600">{group.members?.length || 0} anggota</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery.trim() !== '' && !loading && filteredUsers.length === 0 && filteredGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                <Search className="w-16 h-16 mb-4" />
                <p>Tidak ada hasil untuk "{searchQuery}"</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}